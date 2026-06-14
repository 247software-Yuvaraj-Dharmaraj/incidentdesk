import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Density = 'comfortable' | 'compact';

interface DensityContextValue {
	density: Density;
	toggleDensity: () => void;
	setDensity: (density: Density) => void;
}

const DensityContext = createContext<DensityContextValue | undefined>(undefined);

function getInitial(): Density {
	return localStorage.getItem('density') === 'compact' ? 'compact' : 'comfortable';
}

export function DensityProvider({ children }: { children: ReactNode }) {
	const [density, setDensity] = useState<Density>(getInitial);

	useEffect(() => {
		localStorage.setItem('density', density);
		// Compact scales the root font size down. Since Tailwind sizes type, padding,
		// gaps, and margins in rem, this condenses the entire app proportionally —
		// even surfaces with no explicit density styling. Per-component tweaks layer
		// on top of this for extra emphasis in dense areas (lists, tables, cards).
		const root = document.documentElement;
		root.dataset.density = density;
		root.style.fontSize = density === 'compact' ? '15px' : '';
	}, [density]);

	const toggleDensity = useCallback(() => {
		setDensity((prev) => (prev === 'compact' ? 'comfortable' : 'compact'));
	}, []);

	const value = useMemo(() => ({ density, toggleDensity, setDensity }), [density, toggleDensity]);

	return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDensity(): DensityContextValue {
	const ctx = useContext(DensityContext);
	if (!ctx) throw new Error('useDensity must be used within a DensityProvider');
	return ctx;
}
