import { type TrendPoint } from '@/types/incident';

interface Props {
	data: TrendPoint[];
	createdLabel: string;
	resolvedLabel: string;
}

/** Lightweight grouped bar chart (no chart library) for the 14-day created/resolved trend. */
export function TrendChart({ data, createdLabel, resolvedLabel }: Props) {
	const max = Math.max(1, ...data.map((d) => Math.max(d.created, d.resolved)));

	return (
		<div>
			<div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
				<span className="flex items-center gap-1.5">
					<span className="bg-brand h-2.5 w-2.5 rounded-sm" />
					{createdLabel}
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-sm bg-green-500" />
					{resolvedLabel}
				</span>
			</div>

			<div className="mt-3 flex h-40 items-end gap-1 border-b border-slate-200 dark:border-slate-800">
				{data.map((d) => (
					<div
						key={d.date}
						className="flex h-full flex-1 items-end justify-center gap-0.5"
						title={`${new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${createdLabel} ${d.created} · ${resolvedLabel} ${d.resolved}`}
					>
						<div className="bg-brand w-1/2 rounded-t-sm transition-all" style={{ height: d.created ? `max(${(d.created / max) * 100}%, 3px)` : '0' }} />
						<div className="w-1/2 rounded-t-sm bg-green-500 transition-all" style={{ height: d.resolved ? `max(${(d.resolved / max) * 100}%, 3px)` : '0' }} />
					</div>
				))}
			</div>
			<div className="mt-1 flex gap-1">
				{data.map((d) => (
					<span key={d.date} className="flex-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
						{new Date(`${d.date}T00:00:00`).getDate()}
					</span>
				))}
			</div>
		</div>
	);
}
