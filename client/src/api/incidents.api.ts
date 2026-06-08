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
