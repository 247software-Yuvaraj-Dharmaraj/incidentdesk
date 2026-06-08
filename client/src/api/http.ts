import axios from 'axios';

export const http = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api`,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
});

/** Normalizes an axios error into a user-facing message. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
	if (axios.isAxiosError(error)) {
		return error.response?.data?.error ?? fallback;
	}
	return fallback;
}
