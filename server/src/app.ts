import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, isProd } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import authRoutes from './routes/auth.routes.js';
import incidentRoutes from './routes/incident.routes.js';
import userRoutes from './routes/user.routes.js';

export function createApp() {
	const app = express();

	// Behind a hosting proxy (e.g. Render), trust it so secure cookies work over HTTPS.
	if (isProd) {
		app.set('trust proxy', 1);
	}

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
	app.use('/api/incidents', incidentRoutes);
	app.use('/api/users', userRoutes);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}
