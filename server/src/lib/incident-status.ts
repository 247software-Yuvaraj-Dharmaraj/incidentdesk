import { Status } from '@prisma/client';

/**
 * Allowed status transitions. CLOSED is terminal — a closed incident cannot be reopened.
 * OPEN/IN_PROGRESS/RESOLVED can move forward or step back to keep an active incident workable.
 */
const ALLOWED: Record<Status, Status[]> = {
	[Status.OPEN]: [Status.IN_PROGRESS, Status.RESOLVED, Status.CLOSED],
	[Status.IN_PROGRESS]: [Status.OPEN, Status.RESOLVED, Status.CLOSED],
	[Status.RESOLVED]: [Status.IN_PROGRESS, Status.CLOSED],
	[Status.CLOSED]: [],
};

export function canTransition(from: Status, to: Status): boolean {
	return from === to || ALLOWED[from].includes(to);
}

/** Statuses an incident may move to from its current one (excludes the current status). */
export function nextStatuses(from: Status): Status[] {
	return ALLOWED[from];
}
