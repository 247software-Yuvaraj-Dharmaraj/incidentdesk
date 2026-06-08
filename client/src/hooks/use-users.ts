import { useQuery } from '@tanstack/react-query';
import * as usersApi from '@/api/users.api';

export function useUsers(enabled: boolean) {
	return useQuery({
		queryKey: ['users'],
		queryFn: usersApi.listUsers,
		enabled,
		staleTime: 5 * 60_000,
	});
}
