import { type ErrorRequestHandler, type RequestHandler } from 'express';
import { ZodError } from 'zod';
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

	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal server error' });
};
