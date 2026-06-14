import { type Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const userPreview = { select: { id: true, fullName: true, email: true } };

const incidentInclude = {
	reporter: userPreview,
	assignee: userPreview,
} satisfies Prisma.IncidentInclude;

// List rows never render `description` (a TEXT column up to 2000 chars) — the
// detail drawer refetches the full incident by id. Select everything the list
// uses and omit description to avoid over-fetching it on every page.
const listSelect = {
	id: true,
	title: true,
	type: true,
	priority: true,
	status: true,
	dueDate: true,
	resolvedAt: true,
	reporterId: true,
	assigneeId: true,
	createdAt: true,
	updatedAt: true,
	reporter: userPreview,
	assignee: userPreview,
} satisfies Prisma.IncidentSelect;

const detailInclude = {
	reporter: userPreview,
	assignee: userPreview,
	auditLogs: {
		include: { actor: userPreview },
		orderBy: { createdAt: 'desc' },
	},
} satisfies Prisma.IncidentInclude;

export function createIncident(data: Prisma.IncidentCreateInput) {
	return prisma.incident.create({ data, include: incidentInclude });
}

export function findIncidentById(id: string) {
	return prisma.incident.findUnique({ where: { id }, include: detailInclude });
}

export type AuditEntry = {
	field: string;
	oldValue: string | null;
	newValue: string | null;
};

/** Applies an update and records its audit trail in a single transaction. */
export function updateIncident(id: string, data: Prisma.IncidentUpdateInput, actorId: string, entries: AuditEntry[]) {
	return prisma.$transaction(async (tx) => {
		await tx.incident.update({ where: { id }, data });
		if (entries.length > 0) {
			await tx.auditLog.createMany({
				data: entries.map((entry) => ({ ...entry, incidentId: id, actorId })),
			});
		}
		// Re-read so the returned detail includes the freshly written audit rows.
		return tx.incident.findUniqueOrThrow({ where: { id }, include: detailInclude });
	});
}

interface ListArgs {
	where: Prisma.IncidentWhereInput;
	cursor?: string;
	limit: number;
}

export function countIncidentsByStatus(where: Prisma.IncidentWhereInput) {
	return prisma.incident.groupBy({ by: ['status'], where, _count: { _all: true } });
}

export function deleteIncidentById(id: string) {
	return prisma.incident.delete({ where: { id } });
}

export async function findExistingIncidentIds(ids: string[]) {
	const rows = await prisma.incident.findMany({ where: { id: { in: ids } }, select: { id: true } });
	return rows.map((r) => r.id);
}

export function deleteIncidentsByIds(ids: string[]) {
	return prisma.incident.deleteMany({ where: { id: { in: ids } } });
}

export async function listIncidents({ where, cursor, limit }: ListArgs) {
	// Fetch one extra row to determine whether another page exists; count the full
	// filtered set in parallel so the UI can show "showing N of total".
	const [rows, total] = await Promise.all([
		prisma.incident.findMany({
			where,
			select: listSelect,
			orderBy: { createdAt: 'desc' },
			take: limit + 1,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
		}),
		prisma.incident.count({ where }),
	]);

	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;
	const nextCursor = hasMore ? items[items.length - 1].id : null;

	return { items, nextCursor, total };
}

/** Created/resolved timestamps of resolved incidents — for mean-time-to-resolution. */
export function findResolvedTimings(where: Prisma.IncidentWhereInput) {
	return prisma.incident.findMany({
		where: { ...where, resolvedAt: { not: null } },
		select: { createdAt: true, resolvedAt: true },
	});
}

/** Incidents created or resolved since a date — for the activity trend chart. */
export function findTimingsSince(where: Prisma.IncidentWhereInput, since: Date) {
	return prisma.incident.findMany({
		where: { ...where, OR: [{ createdAt: { gte: since } }, { resolvedAt: { gte: since } }] },
		select: { createdAt: true, resolvedAt: true },
	});
}
