import { describe, expect, it } from 'vitest';
import { Status } from '@prisma/client';
import { canTransition, nextStatuses } from '../incident-status.js';

describe('incident status transitions', () => {
	it('allows forward progress through the lifecycle', () => {
		expect(canTransition(Status.OPEN, Status.IN_PROGRESS)).toBe(true);
		expect(canTransition(Status.IN_PROGRESS, Status.RESOLVED)).toBe(true);
		expect(canTransition(Status.RESOLVED, Status.CLOSED)).toBe(true);
	});

	it('treats CLOSED as terminal', () => {
		expect(canTransition(Status.CLOSED, Status.OPEN)).toBe(false);
		expect(canTransition(Status.CLOSED, Status.IN_PROGRESS)).toBe(false);
		expect(nextStatuses(Status.CLOSED)).toEqual([]);
	});

	it('allows reopening before closure but not after', () => {
		expect(canTransition(Status.RESOLVED, Status.IN_PROGRESS)).toBe(true);
		expect(canTransition(Status.IN_PROGRESS, Status.OPEN)).toBe(true);
	});

	it('treats a no-op (same status) as valid', () => {
		expect(canTransition(Status.OPEN, Status.OPEN)).toBe(true);
	});
});
