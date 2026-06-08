import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as incidentsApi from '@/api/incidents.api';
import { type Incident, type IncidentFilters } from '@/types/incident';

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

export function useIncidentStats() {
	return useQuery({
		queryKey: ['incidents', 'stats'],
		queryFn: incidentsApi.getStats,
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

interface UpdateVars {
	id: string;
	payload: incidentsApi.UpdateIncidentPayload;
}

export function useUpdateIncident() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: UpdateVars) => incidentsApi.updateIncident(id, payload),
		// Optimistically apply the change to the detail cache, then reconcile.
		onMutate: async ({ id, payload }) => {
			const key = incidentKeys.detail(id);
			await queryClient.cancelQueries({ queryKey: key });
			const previous = queryClient.getQueryData<Incident>(key);
			if (previous) {
				queryClient.setQueryData<Incident>(key, {
					...previous,
					...(payload.status ? { status: payload.status } : {}),
					...(payload.priority ? { priority: payload.priority } : {}),
				});
			}
			return { previous };
		},
		onError: (_err, { id }, context) => {
			if (context?.previous) {
				queryClient.setQueryData(incidentKeys.detail(id), context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: incidentKeys.all });
		},
	});
}
