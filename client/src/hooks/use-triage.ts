import { useMutation, useQuery } from '@tanstack/react-query';
import * as incidentsApi from '@/api/incidents.api';

export function useTriageEnabled() {
	return useQuery({
		queryKey: ['triage-enabled'],
		queryFn: incidentsApi.getTriageEnabled,
		staleTime: Infinity,
	});
}

export function useTriage() {
	return useMutation({ mutationFn: incidentsApi.triageIncident });
}
