import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/i18n';
import * as incidentsApi from '@/api/incidents.api';
import { type Incident, type IncidentFilters, type IncidentPage } from '@/types/incident';

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
			toast.success(i18n.t('toast.incidentCreated'));
		},
	});
}

export function useDeleteIncident() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: incidentsApi.deleteIncident,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: incidentKeys.all });
			toast.success(i18n.t('toast.incidentDeleted'));
		},
		onError: () => {
			toast.error(i18n.t('toast.deleteFailed'));
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
		// Optimistically apply the change to BOTH the detail cache and every list/board
		// query (so a Kanban drag moves the card instantly), then reconcile on settle.
		onMutate: async ({ id, payload }) => {
			await queryClient.cancelQueries({ queryKey: incidentKeys.all });

			const patch = {
				...(payload.status ? { status: payload.status } : {}),
				...(payload.priority ? { priority: payload.priority } : {}),
				...(payload.assigneeId !== undefined ? { assigneeId: payload.assigneeId } : {}),
			};

			const prevDetail = queryClient.getQueryData<Incident>(incidentKeys.detail(id));
			if (prevDetail) {
				queryClient.setQueryData<Incident>(incidentKeys.detail(id), { ...prevDetail, ...patch });
			}

			const prevLists = queryClient.getQueriesData<InfiniteData<IncidentPage>>({ queryKey: ['incidents', 'list'] });
			queryClient.setQueriesData<InfiniteData<IncidentPage>>({ queryKey: ['incidents', 'list'] }, (old) =>
				old
					? {
							...old,
							pages: old.pages.map((page) => ({
								...page,
								items: page.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
							})),
						}
					: old
			);

			// Confirm immediately — the UI already reflects the change (optimistic).
			const toastId = toast.success(i18n.t('toast.incidentUpdated'));
			return { prevDetail, prevLists, toastId };
		},
		onError: (_err, { id }, context) => {
			if (context?.prevDetail) {
				queryClient.setQueryData(incidentKeys.detail(id), context.prevDetail);
			}
			context?.prevLists?.forEach(([key, data]) => queryClient.setQueryData(key, data));
			// Replace the optimistic success toast with the failure.
			if (context?.toastId) toast.dismiss(context.toastId);
			toast.error(i18n.t('toast.updateFailed'));
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: incidentKeys.all });
		},
	});
}
