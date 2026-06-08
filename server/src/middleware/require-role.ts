import { type RequestHandler } from 'express';
import { type Role } from '@prisma/client';
import { ApiError } from '../lib/api-error.js';

/**
 * Guards a route to the given roles. Must run after `requireAuth`.
 */
export function requireRole(...roles: Role[]): RequestHandler {
	return (req, _res, next) => {
		if (!req.user) {
			next(ApiError.unauthorized());
			return;
		}
		if (!roles.includes(req.user.role)) {
			next(ApiError.forbidden('You do not have permission to perform this action'));
			return;
		}
		next();
	};
}
