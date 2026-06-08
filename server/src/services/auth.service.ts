import bcrypt from 'bcryptjs';
import { type User } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../lib/api-error.js';
import { type LoginInput, type SignupInput } from '../schemas/auth.schema.js';

export type SafeUser = Omit<User, 'passwordHash'>;

const SALT_ROUNDS = 10;

function toSafeUser(user: User): SafeUser {
	const { passwordHash: _passwordHash, ...safe } = user;
	return safe;
}

export async function registerUser(input: SignupInput): Promise<SafeUser> {
	const existing = await prisma.user.findUnique({ where: { email: input.email } });
	if (existing) {
		throw ApiError.conflict('An account with this email already exists');
	}

	const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
	const user = await prisma.user.create({
		data: { email: input.email, passwordHash, fullName: input.fullName },
	});

	return toSafeUser(user);
}

export async function authenticateUser(input: LoginInput): Promise<SafeUser> {
	const user = await prisma.user.findUnique({ where: { email: input.email } });
	if (!user) {
		throw ApiError.unauthorized('Invalid email or password');
	}

	const valid = await bcrypt.compare(input.password, user.passwordHash);
	if (!valid) {
		throw ApiError.unauthorized('Invalid email or password');
	}

	return toSafeUser(user);
}

export async function getUserById(id: string): Promise<SafeUser | null> {
	const user = await prisma.user.findUnique({ where: { id } });
	return user ? toSafeUser(user) : null;
}
