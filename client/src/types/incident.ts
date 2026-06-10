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

export interface Comment {
	id: string;
	body: string;
	internal: boolean;
	author: UserPreview;
	createdAt: string;
}

export interface Incident {
	id: string;
	title: string;
	type: IncidentType;
	priority: Priority;
	status: Status;
	description: string | null;
	dueDate: string | null;
	resolvedAt: string | null;
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
	assigneeId?: string;
	overdue?: boolean;
}

/** True when an incident is past its due date and not yet resolved or closed. */
export function isOverdue(incident: Pick<Incident, 'dueDate' | 'status'>): boolean {
	return !!incident.dueDate && incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && new Date(incident.dueDate).getTime() < Date.now();
}

export interface IncidentPage {
	items: Incident[];
	nextCursor: string | null;
	total: number;
}

export interface TrendPoint {
	date: string;
	created: number;
	resolved: number;
}

export interface IncidentMetrics {
	mttrHours: number | null;
	resolvedCount: number;
	trend: TrendPoint[];
}

export const INCIDENT_TYPES: IncidentType[] = ['INCIDENT', 'REQUEST', 'MAINTENANCE'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STATUSES: Status[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
