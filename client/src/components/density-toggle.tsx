import { useTranslation } from 'react-i18next';
import { Rows2, Rows3 } from 'lucide-react';
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
			{isCompact ? <Rows2 className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
		</button>
	);
}
