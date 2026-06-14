// Standalone runner for `npm run seed`. The actual logic lives in src/seed.ts so the server
// can reuse it on boot (and so it's part of the compiled build). Run with: npm run seed
import { seedDatabase } from '../src/seed.js';

seedDatabase()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
