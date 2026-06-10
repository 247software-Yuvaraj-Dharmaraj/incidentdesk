import { http } from './http';
import { type CreateIncidentValues } from '@/schemas/incident.schema';
import { type Comment, type Incident, type IncidentFilters, type IncidentMetrics, type IncidentPage } from '@/types/incident';

interface ListParams extends IncidentFilters {
	cursor?: string;
	limit?: number;
}

export async function listIncidents(params: ListParams): Promise<IncidentPage> {
	const { data } = await http.get<IncidentPage>('/incidents', { params });
	return data;
}

export async function createIncident(payload: CreateIncidentValues): Promise<Incident> {
	const { data } = await http.post<{ incident: Incident }>('/incidents', payload);
	return data.incident;
}

export async function getIncident(id: string): Promise<Incident> {
	const { data } = await http.get<{ incident: Incident }>(`/incidents/${id}`);
	return data.incident;
}

export async function deleteIncident(id: string): Promise<void> {
	await http.delete(`/incidents/${id}`);
}

export interface TriageResult {
	type: Incident['type'];
	priority: Incident['priority'];
	summary: string;
}

export async function getTriageEnabled(): Promise<boolean> {
	const { data } = await http.get<{ enabled: boolean }>('/incidents/triage/status');
	return data.enabled;
}

export async function triageIncident(payload: { title: string; description?: string }): Promise<TriageResult> {
	const { data } = await http.post<TriageResult>('/incidents/triage', payload);
	return data;
}

export interface IncidentStats {
	total: number;
	byStatus: Record<Incident['status'], number>;
}

export async function getStats(): Promise<IncidentStats> {
	const { data } = await http.get<IncidentStats>('/incidents/stats');
	return data;
}

export async function getMetrics(): Promise<IncidentMetrics> {
	const { data } = await http.get<IncidentMetrics>('/incidents/metrics');
	return data;
}

export interface UpdateIncidentPayload {
	status?: Incident['status'];
	priority?: Incident['priority'];
	assigneeId?: string | null;
	dueDate?: string | null;
	/** updatedAt the client last saw — server rejects (409) if the incident changed since. */
	expectedUpdatedAt?: string;
}

export async function updateIncident(id: string, payload: UpdateIncidentPayload): Promise<Incident> {
	const { data } = await http.patch<{ incident: Incident }>(`/incidents/${id}`, payload);
	return data.incident;
}

export interface BulkUpdatePayload {
	ids: string[];
	status?: Incident['status'];
	priority?: Incident['priority'];
	assigneeId?: string | null;
}

export async function bulkUpdate(payload: BulkUpdatePayload): Promise<{ updated: number; skipped: number }> {
	const { data } = await http.post<{ updated: number; skipped: number }>('/incidents/bulk-update', payload);
	return data;
}

export async function bulkDelete(ids: string[]): Promise<{ deleted: number }> {
	const { data } = await http.post<{ deleted: number }>('/incidents/bulk-delete', { ids });
	return data;
}

export async function listComments(id: string): Promise<Comment[]> {
	const { data } = await http.get<{ comments: Comment[] }>(`/incidents/${id}/comments`);
	return data.comments;
}

export async function addComment(id: string, body: string): Promise<Comment> {
	const { data } = await http.post<{ comment: Comment }>(`/incidents/${id}/comments`, { body });
	return data.comment;
}
