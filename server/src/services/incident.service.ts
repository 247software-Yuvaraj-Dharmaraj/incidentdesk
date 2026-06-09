import { type Prisma, Role, Status } from '@prisma/client';
import { ApiError } from '../lib/api-error.js';
import { type AuthUser } from '../types/auth.js';
import { type CreateIncidentInput, type ListIncidentsQuery, type UpdateIncidentInput } from '../schemas/incident.schema.js';
import { type AuditEntry, countIncidentsByStatus, createIncident, deleteIncidentById, findIncidentById, listIncidents, updateIncident } from '../repos/incident.repo.js';
import { findUserExists } from '../repos/user.repo.js';
import { emitIncidentsChanged } from '../lib/realtime.js';

export async function createIncidentForUser(input: CreateIncidentInput, user: AuthUser) {
	const incident = await createIncident({
		title: input.title,
		type: input.type,
		priority: input.priority,
		description: input.description,
		reporter: { connect: { id: user.id } },
	});
	emitIncidentsChanged();
	return incident;
}

export async function getStatsForUser(user: AuthUser) {
	const where: Prisma.IncidentWhereInput = user.role === Role.REPORTER ? { reporterId: user.id } : {};
	const grouped = await countIncidentsByStatus(where);

	const byStatus: Record<Status, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };
	let total = 0;
	for (const row of grouped) {
		byStatus[row.status] = row._count._all;
		total += row._count._all;
	}

	return { total, byStatus };
}

export function listIncidentsForUser(query: ListIncidentsQuery, user: AuthUser) {
	const where: Prisma.IncidentWhereInput = {
		...(query.status ? { status: query.status } : {}),
		...(query.type ? { type: query.type } : {}),
		...(query.priority ? { priority: query.priority } : {}),
		...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}),
		...(query.assigneeId ? { assigneeId: query.assigneeId === 'unassigned' ? null : query.assigneeId } : {}),
		// Reporters only ever see their own incidents.
		...(user.role === Role.REPORTER ? { reporterId: user.id } : {}),
	};

	return listIncidents({ where, cursor: query.cursor, limit: query.limit });
}

export async function getIncidentForUser(id: string, user: AuthUser) {
	const incident = await findIncidentById(id);

	// Return 404 (not 403) for non-owned records so we don't leak existence.
	if (!incident || (user.role === Role.REPORTER && incident.reporterId !== user.id)) {
		throw ApiError.notFound('Incident not found');
	}

	return incident;
}

/** Admin-only. Applies changes and records an audit entry per changed field. */
export async function updateIncidentByAdmin(id: string, input: UpdateIncidentInput, actor: AuthUser) {
	const existing = await findIncidentById(id);
	if (!existing) {
		throw ApiError.notFound('Incident not found');
	}

	if (input.assigneeId) {
		const assignee = await findUserExists(input.assigneeId);
		if (!assignee) {
			throw ApiError.badRequest('Assignee does not exist');
		}
	}

	const data: Prisma.IncidentUpdateInput = {};
	const entries: AuditEntry[] = [];

	if (input.status && input.status !== existing.status) {
		data.status = input.status;
		entries.push({ field: 'status', oldValue: existing.status, newValue: input.status });
	}
	if (input.priority && input.priority !== existing.priority) {
		data.priority = input.priority;
		entries.push({ field: 'priority', oldValue: existing.priority, newValue: input.priority });
	}
	if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
		data.assignee = input.assigneeId ? { connect: { id: input.assigneeId } } : { disconnect: true };
		entries.push({ field: 'assignee', oldValue: existing.assigneeId, newValue: input.assigneeId });
	}

	// Nothing actually changed — return the current state without a no-op audit row.
	if (entries.length === 0) {
		return existing;
	}

	const updated = await updateIncident(id, data, actor.id, entries);
	emitIncidentsChanged();
	return updated;
}

/** Admin-only. Permanently deletes an incident (audit logs cascade). */
export async function deleteIncidentByAdmin(id: string) {
	const existing = await findIncidentById(id);
	if (!existing) {
		throw ApiError.notFound('Incident not found');
	}
	await deleteIncidentById(id);
	emitIncidentsChanged();
}
