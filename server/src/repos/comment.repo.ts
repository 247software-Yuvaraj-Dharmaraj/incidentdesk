import { prisma } from '../lib/prisma.js';

const authorPreview = { select: { id: true, fullName: true, email: true } };

export function listComments(incidentId: string) {
	return prisma.comment.findMany({
		where: { incidentId },
		include: { author: authorPreview },
		orderBy: { createdAt: 'asc' },
	});
}

export function createComment(incidentId: string, authorId: string, body: string) {
	return prisma.comment.create({
		data: { incidentId, authorId, body },
		include: { author: authorPreview },
	});
}
