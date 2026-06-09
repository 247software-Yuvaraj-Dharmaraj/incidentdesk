import { type Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { AUTH_COOKIE, verifyToken } from './jwt.js';

let io: Server | null = null;

function readCookie(rawCookieHeader: string | undefined, name: string): string | undefined {
	if (!rawCookieHeader) return undefined;
	const match = rawCookieHeader
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`));
	return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

/** Attaches an authenticated Socket.io server to the HTTP server. */
export function initRealtime(server: HttpServer): void {
	io = new Server(server, {
		cors: { origin: env.CLIENT_URL, credentials: true },
	});

	// Only allow sockets that present a valid session cookie.
	io.use((socket, next) => {
		try {
			const token = readCookie(socket.handshake.headers.cookie, AUTH_COOKIE);
			if (!token) return next(new Error('unauthorized'));
			verifyToken(token);
			next();
		} catch {
			next(new Error('unauthorized'));
		}
	});
}

/** Notifies all connected clients that incident data changed; they refetch (RBAC-scoped). */
export function emitIncidentsChanged(): void {
	io?.emit('incidents:changed');
}
