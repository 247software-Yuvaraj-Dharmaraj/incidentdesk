import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('app HTTP layer', () => {
	it('GET /api/health returns ok', async () => {
		const res = await request(app).get('/api/health');
		expect(res.status).toBe(200);
		expect(res.body.status).toBe('ok');
	});

	it('GET /api/incidents without auth returns 401', async () => {
		const res = await request(app).get('/api/incidents');
		expect(res.status).toBe(401);
	});

	it('GET /api/auth/me without a cookie returns 401', async () => {
		const res = await request(app).get('/api/auth/me');
		expect(res.status).toBe(401);
	});

	it('POST /api/auth/login with an invalid body returns 400', async () => {
		const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
		expect(res.status).toBe(400);
	});

	it('DELETE /api/incidents/:id without auth returns 401', async () => {
		const res = await request(app).delete('/api/incidents/some-id');
		expect(res.status).toBe(401);
	});

	it('unknown route returns 404', async () => {
		const res = await request(app).get('/api/does-not-exist');
		expect(res.status).toBe(404);
	});
});
