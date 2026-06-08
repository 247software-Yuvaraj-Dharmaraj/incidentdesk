import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import authRoutes from './routes/auth.routes.js';

export function createApp() {
	const app = express();

	app.use(express.json());
	app.use(cookieParser());
	app.use(
		cors({
			origin: env.CLIENT_URL,
			credentials: true,
		})
	);

	app.get('/api/health', (_req, res) => {
		res.json({ status: 'ok', timestamp: new Date().toISOString() });
	});

	app.use('/api/auth', authRoutes);
	// app.use('/api/incidents', incidentRoutes);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}
