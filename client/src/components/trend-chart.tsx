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

			<div className="mt-3 flex h-40 items-end gap-1">
				{data.map((d) => (
					<div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${createdLabel} ${d.created} · ${resolvedLabel} ${d.resolved}`}>
						<div className="flex h-full w-full items-end justify-center gap-0.5">
							<div className="bg-brand w-1/2 rounded-t-sm transition-all" style={{ height: `${(d.created / max) * 100}%` }} />
							<div className="w-1/2 rounded-t-sm bg-green-500 transition-all" style={{ height: `${(d.resolved / max) * 100}%` }} />
						</div>
						<span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(`${d.date}T00:00:00`).getDate()}</span>
					</div>
				))}
			</div>
		</div>
	);
}
