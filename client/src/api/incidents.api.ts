import { http } from './http';
import { type CreateIncidentValues } from '@/schemas/incident.schema';
import { type Incident, type IncidentFilters, type IncidentPage } from '@/types/incident';

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

export interface IncidentStats {
	total: number;
	byStatus: Record<Incident['status'], number>;
}

export async function getStats(): Promise<IncidentStats> {
	const { data } = await http.get<IncidentStats>('/incidents/stats');
	return data;
}

export interface UpdateIncidentPayload {
	status?: Incident['status'];
	priority?: Incident['priority'];
	assigneeId?: string | null;
}

export async function updateIncident(id: string, payload: UpdateIncidentPayload): Promise<Incident> {
	const { data } = await http.patch<{ incident: Incident }>(`/incidents/${id}`, payload);
	return data.incident;
}
