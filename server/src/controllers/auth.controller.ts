import { asyncHandler } from '../lib/async-handler.js';
import { authCookieOptions } from '../lib/cookie.js';
import { AUTH_COOKIE, signToken } from '../lib/jwt.js';
import { ApiError } from '../lib/api-error.js';
import { authenticateUser, getUserById, registerUser, updateUserPreferences } from '../services/auth.service.js';
import { type LoginInput, type PreferencesInput, type SignupInput } from '../schemas/auth.schema.js';

export const signup = asyncHandler(async (req, res) => {
	const user = await registerUser(req.body as SignupInput);
	const token = signToken({ sub: user.id, role: user.role });
	res.cookie(AUTH_COOKIE, token, authCookieOptions);
	res.status(201).json({ user });
});

export const login = asyncHandler(async (req, res) => {
	const user = await authenticateUser(req.body as LoginInput);
	const token = signToken({ sub: user.id, role: user.role });
	res.cookie(AUTH_COOKIE, token, authCookieOptions);
	res.json({ user });
});

export const logout = asyncHandler(async (_req, res) => {
	res.clearCookie(AUTH_COOKIE, { ...authCookieOptions, maxAge: undefined });
	res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
	const user = await getUserById(req.user!.id);
	if (!user) {
		throw ApiError.unauthorized('Session user no longer exists');
	}
	res.json({ user });
});

export const updatePreferences = asyncHandler(async (req, res) => {
	const user = await updateUserPreferences(req.user!.id, req.body as PreferencesInput);
	res.json({ user });
});
