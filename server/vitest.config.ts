import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		// Injected so config/env validation passes without a real .env.
		// Tests are written to avoid hitting the database.
		env: {
			DATABASE_URL: 'postgresql://test:test@localhost:5432/test?sslmode=disable',
			JWT_SECRET: 'test-secret-at-least-16-chars',
			JWT_EXPIRES_IN: '7d',
			CLIENT_URL: 'http://localhost:5173',
			NODE_ENV: 'test',
		},
	},
});
