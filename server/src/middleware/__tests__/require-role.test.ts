import { describe, expect, it, vi } from 'vitest';
import { type Request, type Response } from 'express';
import { Role } from '@prisma/client';
import { requireRole } from '../require-role.js';
import { ApiError } from '../../lib/api-error.js';

function run(role: Role | undefined, allowed: Role[]) {
	const req = { user: role ? { id: 'u1', role } : undefined } as Request;
	const next = vi.fn();
	requireRole(...allowed)(req, {} as Response, next);
	return next;
}

describe('requireRole', () => {
	it('calls next() when the role is allowed', () => {
		const next = run(Role.ADMIN, [Role.ADMIN]);
		expect(next).toHaveBeenCalledWith();
	});

	it('passes 403 when the role is not allowed', () => {
		const next = run(Role.REPORTER, [Role.ADMIN]);
		const err = next.mock.calls[0][0] as ApiError;
		expect(err).toBeInstanceOf(ApiError);
		expect(err.statusCode).toBe(403);
	});

	it('passes 401 when there is no authenticated user', () => {
		const next = run(undefined, [Role.ADMIN]);
		const err = next.mock.calls[0][0] as ApiError;
		expect(err.statusCode).toBe(401);
	});
});
