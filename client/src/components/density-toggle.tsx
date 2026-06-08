import { useTranslation } from 'react-i18next';
import { useDensity } from '@/context/density-context';

export function DensityToggle() {
	const { density, toggleDensity } = useDensity();
	const { t } = useTranslation();
	const isCompact = density === 'compact';

	return (
		<button
			type="button"
			onClick={toggleDensity}
			aria-label={t(isCompact ? 'common.comfortableView' : 'common.compactView')}
			aria-pressed={isCompact}
			title={t(isCompact ? 'common.comfortableView' : 'common.compactView')}
			className="rounded-lg border border-slate-300 p-1.5 text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
				{isCompact ? <path d="M3 6h18M3 12h18M3 18h18" /> : <path d="M3 5h18M3 12h18M3 19h18" strokeWidth="3" />}
			</svg>
		</button>
	);
}
