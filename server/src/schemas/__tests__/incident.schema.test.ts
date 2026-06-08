import { describe, expect, it } from 'vitest';
import { createIncidentSchema, updateIncidentSchema } from '../incident.schema.js';

describe('createIncidentSchema', () => {
	it('accepts a valid incident and applies defaults', () => {
		const result = createIncidentSchema.parse({ title: 'Broken door' });
		expect(result.type).toBe('INCIDENT');
		expect(result.priority).toBe('MEDIUM');
	});

	it('rejects a too-short title', () => {
		const result = createIncidentSchema.safeParse({ title: 'ab' });
		expect(result.success).toBe(false);
	});
});

describe('updateIncidentSchema', () => {
	it('requires at least one field', () => {
		const result = updateIncidentSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('accepts a status-only update', () => {
		const result = updateIncidentSchema.safeParse({ status: 'RESOLVED' });
		expect(result.success).toBe(true);
	});

	it('rejects an invalid status', () => {
		const result = updateIncidentSchema.safeParse({ status: 'NOPE' });
		expect(result.success).toBe(false);
	});
});
