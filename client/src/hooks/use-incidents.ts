import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import * as incidentsApi from '@/api/incidents.api';
import { type Comment, type Incident, type IncidentFilters, type IncidentPage } from '@/types/incident';

const PAGE_SIZE = 10;

export const incidentKeys = {
	all: ['incidents'] as const,
	list: (filters: IncidentFilters) => ['incidents', 'list', filters] as const,
	detail: (id: string) => ['incidents', 'detail', id] as const,
	comments: (id: string) => ['incidents', 'detail', id, 'comments'] as const,
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

export function useIncidentMetrics() {
	return useQuery({
		queryKey: ['incidents', 'metrics'],
		queryFn: incidentsApi.getMetrics,
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
				...(payload.dueDate !== undefined ? { dueDate: payload.dueDate } : {}),
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
		onError: (err, { id }, context) => {
			if (context?.prevDetail) {
				queryClient.setQueryData(incidentKeys.detail(id), context.prevDetail);
			}
			context?.prevLists?.forEach(([key, data]) => queryClient.setQueryData(key, data));
			// Replace the optimistic success toast with the failure.
			if (context?.toastId) toast.dismiss(context.toastId);
			// 409 = a stale write (concurrency conflict) or a disallowed status transition.
			if (isAxiosError(err) && err.response?.status === 409) {
				toast.error(err.response.data?.error ?? i18n.t('toast.updateConflict'));
			} else {
				toast.error(i18n.t('toast.updateFailed'));
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: incidentKeys.all });
		},
	});
}

export function useBulkUpdate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: incidentsApi.bulkUpdate,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: incidentKeys.all });
			toast.success(i18n.t('toast.bulkUpdated', { count: res.updated }));
		},
		onError: () => toast.error(i18n.t('toast.updateFailed')),
	});
}

export function useBulkDelete() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: incidentsApi.bulkDelete,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: incidentKeys.all });
			toast.success(i18n.t('toast.bulkDeleted', { count: res.deleted }));
		},
		onError: () => toast.error(i18n.t('toast.deleteFailed')),
	});
}

export function useComments(id: string) {
	return useQuery({
		queryKey: incidentKeys.comments(id),
		queryFn: () => incidentsApi.listComments(id),
	});
}

export function useAddComment(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: string) => incidentsApi.addComment(id, body),
		onSuccess: (comment) => {
			queryClient.setQueryData<Comment[]>(incidentKeys.comments(id), (prev) => [...(prev ?? []), comment]);
		},
		onError: () => {
			toast.error(i18n.t('toast.commentFailed'));
		},
	});
}
