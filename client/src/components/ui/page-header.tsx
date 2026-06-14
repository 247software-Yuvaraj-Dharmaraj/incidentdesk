import { type ReactNode } from 'react';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
	return (
		<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
				{subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
			</div>
			{actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
		</div>
	);
}
