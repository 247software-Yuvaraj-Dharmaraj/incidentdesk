import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Mass-action bar shown when grid rows are selected: count, label, action controls, clear. */
export function SelectionBar({ count, onClear, children }: { count: number; onClear: () => void; children: ReactNode }) {
	const { t } = useTranslation();
	if (count === 0) return null;

	return (
		<div className="border-brand/30 bg-brand/10 mb-3 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-sm shadow-sm">
			<span className="bg-brand text-brand-fg inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold">{count}</span>
			<span className="text-slate-700 dark:text-slate-200">{t('common.selected')}</span>
			<div className="bg-brand/30 h-6 w-px" />
			<div className="flex flex-wrap items-center gap-2">{children}</div>
			<button type="button" onClick={onClear} className="ml-auto rounded-md px-2 py-1 text-slate-500 transition hover:bg-black/5 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100">
				{t('common.clear')}
			</button>
		</div>
	);
}
