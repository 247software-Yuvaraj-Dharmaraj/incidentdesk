import { type Status } from '@/types/incident';

/** Mirrors the server's transition rules (server is the source of truth; this drives the UI). */
const ALLOWED: Record<Status, Status[]> = {
	OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
	IN_PROGRESS: ['OPEN', 'RESOLVED', 'CLOSED'],
	RESOLVED: ['IN_PROGRESS', 'CLOSED'],
	CLOSED: [],
};

/** Statuses selectable from the current one: the current status plus its allowed transitions. */
export function selectableStatuses(current: Status): Status[] {
	return [current, ...ALLOWED[current]];
}
