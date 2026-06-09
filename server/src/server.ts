import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initRealtime } from './lib/realtime.js';

const app = createApp();
const server = createServer(app);
initRealtime(server);

server.listen(env.PORT, () => {
	console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});
