import { type Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const userPreview = { select: { id: true, fullName: true, email: true } };

const incidentInclude = {
	reporter: userPreview,
	assignee: userPreview,
} satisfies Prisma.IncidentInclude;

export function createIncident(data: Prisma.IncidentCreateInput) {
	return prisma.incident.create({ data, include: incidentInclude });
}

export function findIncidentById(id: string) {
	return prisma.incident.findUnique({ where: { id }, include: incidentInclude });
}

interface ListArgs {
	where: Prisma.IncidentWhereInput;
	cursor?: string;
	limit: number;
}

export async function listIncidents({ where, cursor, limit }: ListArgs) {
	// Fetch one extra row to determine whether another page exists.
	const rows = await prisma.incident.findMany({
		where,
		include: incidentInclude,
		orderBy: { createdAt: 'desc' },
		take: limit + 1,
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
	});

	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;
	const nextCursor = hasMore ? items[items.length - 1].id : null;

	return { items, nextCursor };
}
