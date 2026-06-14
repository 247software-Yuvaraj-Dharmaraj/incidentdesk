export type Role = 'ADMIN' | 'REPORTER';

export interface User {
	id: string;
	email: string;
	fullName: string;
	role: Role;
	theme: 'light' | 'dark';
	density: 'comfortable' | 'compact';
	createdAt: string;
}
