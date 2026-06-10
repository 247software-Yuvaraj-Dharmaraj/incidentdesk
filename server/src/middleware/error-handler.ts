import { type ErrorRequestHandler, type RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../lib/api-error.js';

export const notFoundHandler: RequestHandler = (_req, res) => {
	res.status(404).json({ error: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	if (err instanceof ApiError) {
		res.status(err.statusCode).json({ error: err.message, details: err.details });
		return;
	}

	if (err instanceof ZodError) {
		res.status(400).json({ error: 'Validation failed', details: err.flatten() });
		return;
	}

	// Map common Prisma errors to meaningful status codes instead of a blanket 500.
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === 'P2025') {
			res.status(404).json({ error: 'Record not found' });
			return;
		}
		if (err.code === 'P2002') {
			res.status(409).json({ error: 'A record with this value already exists' });
			return;
		}
	}

	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal server error' });
};
