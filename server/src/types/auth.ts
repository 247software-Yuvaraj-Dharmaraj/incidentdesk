import { type Role } from '@prisma/client';

export interface AuthUser {
	id: string;
	role: Role;
}

export interface JwtPayload {
	sub: string;
	role: Role;
}
