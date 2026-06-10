import { prisma } from '../lib/prisma.js';

const authorPreview = { select: { id: true, fullName: true, email: true } };

/** Lists comments for an incident. Internal notes are excluded unless includeInternal is set. */
export function listComments(incidentId: string, includeInternal: boolean) {
	return prisma.comment.findMany({
		where: { incidentId, ...(includeInternal ? {} : { internal: false }) },
		include: { author: authorPreview },
		orderBy: { createdAt: 'asc' },
	});
}

export function createComment(incidentId: string, authorId: string, body: string, internal: boolean) {
	return prisma.comment.create({
		data: { incidentId, authorId, body, internal },
		include: { author: authorPreview },
	});
}
