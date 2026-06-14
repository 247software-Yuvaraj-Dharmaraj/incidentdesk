import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useDensity } from '@/context/density-context';
import { updatePreferences } from '@/api/auth.api';

// Syncs theme + density with the logged-in user's ACCOUNT: hydrate once per login,
// then persist changes back. Keeping these per-account means a different user
// signing in on the same device gets their OWN preferences instead of inheriting
// whatever the previous user left in localStorage. localStorage still seeds the
// initial theme, so a returning same user sees no flip (it matches their account).
export function usePreferenceSync() {
	const { user } = useAuth();
	const { theme, setTheme } = useTheme();
	const { density, setDensity } = useDensity();

	// Last value known to match the server, so we only PATCH genuine user changes
	// (not the hydration write). hydratedFor gates one hydration per login.
	const hydratedFor = useRef<string | null>(null);
	const serverTheme = useRef<string | null>(null);
	const serverDensity = useRef<string | null>(null);

	// Hydrate theme + density once per login from the account.
	useEffect(() => {
		if (!user) {
			hydratedFor.current = null;
			serverTheme.current = null;
			serverDensity.current = null;
			return;
		}
		if (hydratedFor.current === user.id) return;
		hydratedFor.current = user.id;
		serverTheme.current = user.theme;
		serverDensity.current = user.density;
		if (user.theme !== theme) setTheme(user.theme);
		if (user.density !== density) setDensity(user.density);
	}, [user, theme, density, setTheme, setDensity]);

	// Persist theme changes back to the account.
	useEffect(() => {
		if (!user || serverTheme.current === null || serverTheme.current === theme) return;
		serverTheme.current = theme;
		void updatePreferences({ theme }).catch(() => {});
	}, [user, theme]);

	// Persist density changes back to the account.
	useEffect(() => {
		if (!user || serverDensity.current === null || serverDensity.current === density) return;
		serverDensity.current = density;
		void updatePreferences({ density }).catch(() => {});
	}, [user, density]);
}
