import { http } from './http';
import { type User } from '@/types/user';

interface AuthResponse {
	user: User;
}

export interface SignupPayload {
	email: string;
	password: string;
	fullName: string;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export async function signup(payload: SignupPayload): Promise<User> {
	const { data } = await http.post<AuthResponse>('/auth/signup', payload);
	return data.user;
}

export async function login(payload: LoginPayload): Promise<User> {
	const { data } = await http.post<AuthResponse>('/auth/login', payload);
	return data.user;
}

export async function logout(): Promise<void> {
	await http.post('/auth/logout');
}

export async function fetchMe(): Promise<User> {
	const { data } = await http.get<AuthResponse>('/auth/me');
	return data.user;
}

export interface PreferencesPayload {
	theme?: 'light' | 'dark';
	density?: 'comfortable' | 'compact';
}

export async function updatePreferences(payload: PreferencesPayload): Promise<User> {
	const { data } = await http.patch<AuthResponse>('/auth/me/preferences', payload);
	return data.user;
}
