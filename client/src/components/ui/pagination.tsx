import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
}

/** Windowed page list: 1 … (p-1) p (p+1) … last. `null` entries render as an ellipsis. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
	const out: (number | null)[] = [1];
	const start = Math.max(2, page - 1);
	const end = Math.min(totalPages - 1, page + 1);
	if (start > 2) out.push(null);
	for (let i = start; i <= end; i++) out.push(i);
	if (end < totalPages - 1) out.push(null);
	out.push(totalPages);
	return out;
}

const navBtn = 'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-300 px-2 text-sm text-slate-600 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800';

/** Offset pagination: range summary on the left, numbered page controls on the right. */
export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
	const { t } = useTranslation();
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	if (totalPages <= 1) return null;

	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);
	const go = (p: number) => onPageChange(Math.min(totalPages, Math.max(1, p)));

	return (
		<nav className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label={t('incidents.pagination')}>
			<p className="text-xs text-slate-500 dark:text-slate-400">{t('incidents.showingRange', { from, to, total })}</p>
			<div className="flex items-center gap-1">
				<button type="button" className={navBtn} onClick={() => go(page - 1)} disabled={page <= 1} aria-label={t('incidents.prevPage')}>
					<ChevronLeft className="h-4 w-4" />
				</button>
				{pageWindow(page, totalPages).map((p, i) =>
					p === null ? (
						<span key={`gap-${i}`} className="px-1 text-sm text-slate-400 dark:text-slate-500" aria-hidden="true">
							…
						</span>
					) : (
						<button
							key={p}
							type="button"
							onClick={() => go(p)}
							aria-current={p === page ? 'page' : undefined}
							className={p === page ? 'bg-brand text-brand-fg inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium' : navBtn}
						>
							{p}
						</button>
					)
				)}
				<button type="button" className={navBtn} onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label={t('incidents.nextPage')}>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</nav>
	);
}
