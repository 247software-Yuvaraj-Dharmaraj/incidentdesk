import axios from 'axios';
import i18n from '@/i18n';

export const http = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api`,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
});

// On session expiry (401), send the user back to login — but not on the auth probe
// (/auth/me) or the login call, where a 401 is an expected response, and not if
// we're already on the login page.
http.interceptors.response.use(
	(response) => response,
	(error) => {
		if (axios.isAxiosError(error)) {
			const url = error.config?.url ?? '';
			const isAuthProbe = url.includes('/auth/me') || url.includes('/auth/login');
			if (error.response?.status === 401 && !isAuthProbe && window.location.pathname !== '/login') {
				window.location.assign('/login');
			}
		}
		return Promise.reject(error);
	}
);

/** Normalizes an axios error into a user-facing message. */
export function getErrorMessage(error: unknown, fallback = i18n.t('errors.generic')): string {
	if (axios.isAxiosError(error)) {
		return error.response?.data?.error ?? fallback;
	}
	return fallback;
}
