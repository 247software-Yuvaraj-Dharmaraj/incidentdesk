import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initRealtime } from './lib/realtime.js';
import { seedDatabase } from './seed.js';

async function bootstrap() {
	// TEMP (demo data): reseed the rich demo dataset on boot unless SEED_RESET=false.
	// Wrapped so a seeding issue can never stop the server. Revert the rich-seed commit to disable.
	if (process.env.SEED_RESET !== 'false') {
		try {
			await seedDatabase();
		} catch (err) {
			console.error('[seed] demo reseed failed (server still starts)', err);
		}
	}

	const app = createApp();
	const server = createServer(app);
	initRealtime(server);

	server.listen(env.PORT, () => {
		console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
	});
}

void bootstrap();
