import { type ReactNode } from 'react';

interface EmptyStateProps {
	icon: ReactNode;
	title: string;
	hint?: string;
	action?: ReactNode;
}

/** Centered empty/zero-data state: a tinted icon medallion, title, optional hint, optional action. */
export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
			<div className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-full" aria-hidden="true">
				{icon}
			</div>
			<div>
				<p className="font-medium text-slate-800 dark:text-slate-100">{title}</p>
				{hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
			</div>
			{action}
		</div>
	);
}
