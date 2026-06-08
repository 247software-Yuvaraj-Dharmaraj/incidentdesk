import { type RequestHandler } from 'express';
import { AUTH_COOKIE, verifyToken } from '../lib/jwt.js';
import { ApiError } from '../lib/api-error.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
	const token = req.cookies?.[AUTH_COOKIE];
	if (!token) {
		next(ApiError.unauthorized('Authentication required'));
		return;
	}

	try {
		const payload = verifyToken(token);
		req.user = { id: payload.sub, role: payload.role };
		next();
	} catch {
		next(ApiError.unauthorized('Invalid or expired session'));
	}
};
