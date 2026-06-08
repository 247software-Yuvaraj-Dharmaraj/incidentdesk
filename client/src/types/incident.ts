export type IncidentType = 'INCIDENT' | 'REQUEST' | 'MAINTENANCE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface UserPreview {
	id: string;
	fullName: string;
	email: string;
}

export interface AuditLog {
	id: string;
	field: string;
	oldValue: string | null;
	newValue: string | null;
	actor: UserPreview;
	createdAt: string;
}

export interface Incident {
	id: string;
	title: string;
	type: IncidentType;
	priority: Priority;
	status: Status;
	description: string | null;
	reporter: UserPreview;
	assignee: UserPreview | null;
	reporterId: string;
	assigneeId: string | null;
	auditLogs?: AuditLog[];
	createdAt: string;
	updatedAt: string;
}

export interface IncidentFilters {
	status?: Status;
	type?: IncidentType;
	priority?: Priority;
	q?: string;
}

export interface IncidentPage {
	items: Incident[];
	nextCursor: string | null;
}

export const INCIDENT_TYPES: IncidentType[] = ['INCIDENT', 'REQUEST', 'MAINTENANCE'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STATUSES: Status[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
