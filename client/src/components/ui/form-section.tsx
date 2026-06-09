import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

interface FormSectionProps {
	title: string;
	backTo?: { href: string; label: string };
	error?: string | null;
	onSubmit: (e: React.FormEvent) => void;
	children: ReactNode;
	footer: ReactNode;
}

/** Consistent layout wrapper for setup/form pages: back link, title, error banner, card body, footer actions. */
export function FormSection({ title, backTo, error, onSubmit, children, footer }: FormSectionProps) {
	return (
		<div className="mx-auto max-w-xl">
			{backTo && (
				<Link to={backTo.href} className="text-sm text-slate-500 hover:underline dark:text-slate-400">
					← {backTo.label}
				</Link>
			)}
			<h1 className="mt-2 mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>

			{error && (
				<div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
					{error}
				</div>
			)}

			<form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
				<Card className="flex flex-col gap-4 p-6">{children}</Card>
				<div className="flex justify-end gap-3">{footer}</div>
			</form>
		</div>
	);
}
