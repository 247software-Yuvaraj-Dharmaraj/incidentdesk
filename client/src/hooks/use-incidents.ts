import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as incidentsApi from '@/api/incidents.api';
import { type IncidentFilters } from '@/types/incident';

const PAGE_SIZE = 10;

export const incidentKeys = {
	all: ['incidents'] as const,
	list: (filters: IncidentFilters) => ['incidents', 'list', filters] as const,
	detail: (id: string) => ['incidents', 'detail', id] as const,
};

export function useIncidents(filters: IncidentFilters) {
	return useInfiniteQuery({
		queryKey: incidentKeys.list(filters),
		queryFn: ({ pageParam }) => incidentsApi.listIncidents({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
}

export function useIncident(id: string) {
	return useQuery({
		queryKey: incidentKeys.detail(id),
		queryFn: () => incidentsApi.getIncident(id),
	});
}

export function useCreateIncident() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: incidentsApi.createIncident,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: incidentKeys.all });
		},
	});
}
