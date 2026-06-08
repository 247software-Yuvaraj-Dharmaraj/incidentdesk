import { type Priority, type Status } from '@/types/incident';

const statusStyles: Record<Status, string> = {
	OPEN: 'bg-blue-50 text-blue-700 ring-blue-600/20',
	IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-600/20',
	RESOLVED: 'bg-green-50 text-green-700 ring-green-600/20',
	CLOSED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

const priorityStyles: Record<Priority, string> = {
	LOW: 'bg-slate-100 text-slate-600 ring-slate-500/20',
	MEDIUM: 'bg-sky-50 text-sky-700 ring-sky-600/20',
	HIGH: 'bg-orange-50 text-orange-700 ring-orange-600/20',
	CRITICAL: 'bg-red-50 text-red-700 ring-red-600/20',
};

function Pill({ label, className }: { label: string; className: string }) {
	return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{label.replace('_', ' ')}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
	return <Pill label={status} className={statusStyles[status]} />;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
	return <Pill label={priority} className={priorityStyles[priority]} />;
}
