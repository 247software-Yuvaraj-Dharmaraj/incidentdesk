import { type CookieOptions } from 'express';
import { isProd } from '../config/env.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const authCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? 'none' : 'lax',
	maxAge: SEVEN_DAYS_MS,
	path: '/',
};
