import { prisma } from '../lib/prisma.js';

const select = { id: true, fullName: true, email: true, role: true };

export function listUsers() {
	return prisma.user.findMany({ select, orderBy: { fullName: 'asc' } });
}

export function findUserExists(id: string) {
	return prisma.user.findUnique({ where: { id }, select: { id: true } });
}
