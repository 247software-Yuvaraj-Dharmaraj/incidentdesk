import { http } from './http';
import { type Role } from '@/types/user';

export interface UserOption {
	id: string;
	fullName: string;
	email: string;
	role: Role;
}

export async function listUsers(): Promise<UserOption[]> {
	const { data } = await http.get<{ users: UserOption[] }>('/users');
	return data.users;
}
