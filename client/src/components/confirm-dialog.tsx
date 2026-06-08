import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
	loading?: boolean;
	destructive?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, loading, destructive }: ConfirmDialogProps) {
	const { t } = useTranslation();
	const confirmRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!open) return;
		confirmRef.current?.focus();
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onCancel();
		}
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [open, onCancel]);

	if (!open) return null;

	const confirmClasses = destructive
		? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400'
		: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200';

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="confirm-title"
				aria-describedby="confirm-message"
				onClick={(e) => e.stopPropagation()}
				className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
			>
				<h2 id="confirm-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
					{title}
				</h2>
				<p id="confirm-message" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
					{message}
				</p>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						{t('common.cancel')}
					</button>
					<button ref={confirmRef} type="button" onClick={onConfirm} disabled={loading} className={`rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60 ${confirmClasses}`}>
						{loading ? t('common.loading') : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
