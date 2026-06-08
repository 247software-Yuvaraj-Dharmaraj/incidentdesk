import { describe, expect, it } from 'vitest';
import { signToken, verifyToken } from '../jwt.js';

describe('jwt', () => {
	it('signs and verifies a token round-trip', () => {
		const token = signToken({ sub: 'user-1', role: 'ADMIN' });
		const payload = verifyToken(token);
		expect(payload.sub).toBe('user-1');
		expect(payload.role).toBe('ADMIN');
	});

	it('rejects a tampered token', () => {
		const token = signToken({ sub: 'user-1', role: 'REPORTER' });
		expect(() => verifyToken(token + 'tampered')).toThrow();
	});
});
