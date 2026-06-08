import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth.api';
import { type User } from '@/types/user';

interface AuthContextValue {
	user: User | null;
	isLoading: boolean;
	login: (payload: authApi.LoginPayload) => Promise<void>;
	signup: (payload: authApi.SignupPayload) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		authApi
			.fetchMe()
			.then(setUser)
			.catch(() => setUser(null))
			.finally(() => setIsLoading(false));
	}, []);

	const login = useCallback(async (payload: authApi.LoginPayload) => {
		setUser(await authApi.login(payload));
	}, []);

	const signup = useCallback(async (payload: authApi.SignupPayload) => {
		setUser(await authApi.signup(payload));
	}, []);

	const logout = useCallback(async () => {
		await authApi.logout();
		setUser(null);
	}, []);

	const value = useMemo(() => ({ user, isLoading, login, signup, logout }), [user, isLoading, login, signup, logout]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return ctx;
}
