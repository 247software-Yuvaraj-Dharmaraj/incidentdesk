import { type Prisma, Role } from '@prisma/client';
import { ApiError } from '../lib/api-error.js';
import { type AuthUser } from '../types/auth.js';
import { type CreateIncidentInput, type ListIncidentsQuery } from '../schemas/incident.schema.js';
import { createIncident, findIncidentById, listIncidents } from '../repos/incident.repo.js';

export function createIncidentForUser(input: CreateIncidentInput, user: AuthUser) {
	return createIncident({
		title: input.title,
		type: input.type,
		priority: input.priority,
		description: input.description,
		reporter: { connect: { id: user.id } },
	});
}

export function listIncidentsForUser(query: ListIncidentsQuery, user: AuthUser) {
	const where: Prisma.IncidentWhereInput = {
		...(query.status ? { status: query.status } : {}),
		...(query.type ? { type: query.type } : {}),
		...(query.priority ? { priority: query.priority } : {}),
		...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}),
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
