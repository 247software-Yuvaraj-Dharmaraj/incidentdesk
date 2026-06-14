import { Activity } from 'lucide-react';

/** Brand mark: a navy badge with a pulse glyph + two-tone wordmark. */
export function Logo({ className = '' }: { className?: string }) {
	return (
		<span className={`inline-flex items-center gap-2 ${className}`}>
			<span className="bg-brand text-brand-fg flex h-7 w-7 items-center justify-center rounded-lg shadow-sm">
				<Activity className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
			</span>
			<span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
				Incident<span className="text-brand">Desk</span>
			</span>
		</span>
	);
}
