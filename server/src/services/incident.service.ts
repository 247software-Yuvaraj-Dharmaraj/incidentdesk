import { type Prisma, Role, Status } from '@prisma/client';
import { ApiError } from '../lib/api-error.js';
import { canTransition } from '../lib/incident-status.js';
import { type AuthUser } from '../types/auth.js';
import { type BulkDeleteInput, type BulkUpdateInput, type CreateIncidentInput, type ListIncidentsQuery, type UpdateIncidentInput } from '../schemas/incident.schema.js';
import { type AuditEntry, countIncidentsByStatus, createIncident, deleteIncidentById, deleteIncidentsByIds, findExistingIncidentIds, findIncidentById, findResolvedTimings, findTimingsSince, listIncidents, updateIncident } from '../repos/incident.repo.js';
import { createComment, listComments } from '../repos/comment.repo.js';
import { findUserExists } from '../repos/user.repo.js';
import { emitIncidentsChanged } from '../lib/realtime.js';

export async function createIncidentForUser(input: CreateIncidentInput, user: AuthUser) {
	const incident = await createIncident({
		title: input.title,
		type: input.type,
		priority: input.priority,
		description: input.description,
		dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
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
		// Overdue = past its due date and not yet resolved/closed.
		...(query.overdue ? { dueDate: { lt: new Date() }, status: { notIn: [Status.RESOLVED, Status.CLOSED] } } : {}),
		// Reporters only ever see their own incidents.
		...(user.role === Role.REPORTER ? { reporterId: user.id } : {}),
	};

	return listIncidents({ where, cursor: query.cursor, limit: query.limit });
}

const TREND_DAYS = 14;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Mean-time-to-resolution (hours) and a 14-day created/resolved trend, role-scoped. */
export async function getMetricsForUser(user: AuthUser) {
	const where: Prisma.IncidentWhereInput = user.role === Role.REPORTER ? { reporterId: user.id } : {};

	const resolved = await findResolvedTimings(where);
	const mttrHours = resolved.length ? resolved.reduce((sum, i) => sum + (i.resolvedAt!.getTime() - i.createdAt.getTime()), 0) / resolved.length / 3_600_000 : null;

	const since = new Date();
	since.setUTCHours(0, 0, 0, 0);
	since.setUTCDate(since.getUTCDate() - (TREND_DAYS - 1));

	// Seed every day in the window so the chart has no gaps.
	const buckets = new Map<string, { date: string; created: number; resolved: number }>();
	for (let i = 0; i < TREND_DAYS; i++) {
		const d = new Date(since);
		d.setUTCDate(since.getUTCDate() + i);
		buckets.set(dayKey(d), { date: dayKey(d), created: 0, resolved: 0 });
	}

	const recent = await findTimingsSince(where, since);
	for (const row of recent) {
		const created = buckets.get(dayKey(row.createdAt));
		if (created) created.created += 1;
		if (row.resolvedAt) {
			const res = buckets.get(dayKey(row.resolvedAt));
			if (res) res.resolved += 1;
		}
	}

	return { mttrHours, resolvedCount: resolved.length, trend: [...buckets.values()] };
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

	// Optimistic concurrency — reject if the incident changed since the client last read it.
	if (input.expectedUpdatedAt && new Date(input.expectedUpdatedAt).getTime() !== existing.updatedAt.getTime()) {
		throw ApiError.conflict('This incident was changed by someone else. Refresh and try again.');
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
		if (!canTransition(existing.status, input.status)) {
			throw ApiError.conflict(`Cannot change status from ${existing.status} to ${input.status}`);
		}
		data.status = input.status;
		entries.push({ field: 'status', oldValue: existing.status, newValue: input.status });

		// Stamp the resolution time when entering a closed-out state; clear it when reopened.
		const closedOut = input.status === Status.RESOLVED || input.status === Status.CLOSED;
		if (closedOut && !existing.resolvedAt) {
			data.resolvedAt = new Date();
		} else if (!closedOut && existing.resolvedAt) {
			data.resolvedAt = null;
		}
	}
	if (input.priority && input.priority !== existing.priority) {
		data.priority = input.priority;
		entries.push({ field: 'priority', oldValue: existing.priority, newValue: input.priority });
	}
	if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
		data.assignee = input.assigneeId ? { connect: { id: input.assigneeId } } : { disconnect: true };
		entries.push({ field: 'assignee', oldValue: existing.assigneeId, newValue: input.assigneeId });
	}
	if (input.dueDate !== undefined) {
		const newDue = input.dueDate ? new Date(input.dueDate) : null;
		if ((newDue?.getTime() ?? null) !== (existing.dueDate?.getTime() ?? null)) {
			data.dueDate = newDue;
			entries.push({ field: 'dueDate', oldValue: existing.dueDate?.toISOString() ?? null, newValue: newDue?.toISOString() ?? null });
		}
	}

	// Nothing actually changed — return the current state without a no-op audit row.
	if (entries.length === 0) {
		return existing;
	}

	const updated = await updateIncident(id, data, actor.id, entries);
	emitIncidentsChanged();
	return updated;
}

export async function listCommentsForIncident(id: string, user: AuthUser) {
	// Reuse the read-authorization rules (404 for incidents the user can't see).
	await getIncidentForUser(id, user);
	// Internal notes are visible to admins only.
	return listComments(id, user.role === Role.ADMIN);
}

export async function addCommentForIncident(id: string, body: string, internal: boolean, user: AuthUser) {
	await getIncidentForUser(id, user);
	// Only admins can post internal notes.
	const isInternal = internal && user.role === Role.ADMIN;
	const comment = await createComment(id, user.id, body, isInternal);
	emitIncidentsChanged();
	return comment;
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

/** Admin-only. Applies one change set to many incidents, skipping ones whose status transition is disallowed. */
export async function bulkUpdateByAdmin(input: BulkUpdateInput, actor: AuthUser) {
	const { ids, ...patch } = input;
	if (patch.assigneeId) {
		const assignee = await findUserExists(patch.assigneeId);
		if (!assignee) throw ApiError.badRequest('Assignee does not exist');
	}

	let updated = 0;
	// Per-item feedback: record which incidents were skipped and why (e.g. a disallowed
	// status transition or a concurrency conflict on that particular incident).
	const failed: { id: string; reason: string }[] = [];
	for (const id of ids) {
		try {
			await updateIncidentByAdmin(id, patch, actor);
			updated += 1;
		} catch (err) {
			failed.push({ id, reason: err instanceof Error ? err.message : 'Update failed' });
		}
	}
	emitIncidentsChanged();
	return { updated, skipped: failed.length, failed };
}

/** Admin-only. Permanently deletes many incidents, reporting any ids that no longer existed. */
export async function bulkDeleteByAdmin(input: BulkDeleteInput) {
	const existing = new Set(await findExistingIncidentIds(input.ids));
	const { count } = await deleteIncidentsByIds(input.ids);
	emitIncidentsChanged();
	const failed = input.ids.filter((id) => !existing.has(id)).map((id) => ({ id, reason: 'Not found' }));
	return { deleted: count, failed };
}
