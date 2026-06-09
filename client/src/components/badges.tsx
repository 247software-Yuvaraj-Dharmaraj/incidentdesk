import { type Priority, type Status } from '@/types/incident';

const statusStyles: Record<Status, string> = {
	OPEN: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-400/30',
	IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-400/30',
	RESOLVED: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-300 dark:ring-green-400/30',
	CLOSED: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/30',
};

const priorityStyles: Record<Priority, string> = {
	LOW: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/30',
	MEDIUM: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-400/30',
	HIGH: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-400/30',
	CRITICAL: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-400/30',
};

function Pill({ label, className, dot = false }: { label: string; className: string; dot?: boolean }) {
	return (
		<span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
			{dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />}
			{label.replace('_', ' ')}
		</span>
	);
}

export function StatusBadge({ status }: { status: Status }) {
	return <Pill label={status} className={statusStyles[status]} dot />;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
	return <Pill label={priority} className={priorityStyles[priority]} />;
}
