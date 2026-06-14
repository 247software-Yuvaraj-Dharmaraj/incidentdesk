import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { useUpdateIncident } from '@/hooks/use-incidents';
import { useDensity } from '@/context/density-context';
import { PriorityBadge, OverdueBadge } from '@/components/badges';
import { STATUSES, isOverdue, type Incident, type Status } from '@/types/incident';

const COLUMN_ACCENT: Record<Status, string> = {
	OPEN: 'border-t-blue-400 dark:border-t-blue-500',
	IN_PROGRESS: 'border-t-amber-400 dark:border-t-amber-500',
	RESOLVED: 'border-t-green-400 dark:border-t-green-500',
	CLOSED: 'border-t-slate-400 dark:border-t-slate-500',
};

export function IncidentBoard({ incidents, canDrag }: { incidents: Incident[]; canDrag: boolean }) {
	const update = useUpdateIncident();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

	// Size the board to fill the remaining viewport (multi-column layouts only) so
	// the columns end at the bottom edge and the page itself never scrolls.
	const boardRef = useRef<HTMLDivElement>(null);
	const [boardHeight, setBoardHeight] = useState<number>();
	useEffect(() => {
		function recalc() {
			const isSingleRow = window.matchMedia('(min-width: 1024px)').matches;
			if (!isSingleRow || !boardRef.current) {
				setBoardHeight(undefined);
				return;
			}
			// Subtract the board's top offset plus the page's bottom padding (main has py-8 = 32px)
			// so the columns end inside the viewport and the page itself never scrolls.
			const top = boardRef.current.getBoundingClientRect().top;
			setBoardHeight(window.innerHeight - top - 36);
		}
		recalc();
		window.addEventListener('resize', recalc);
		return () => window.removeEventListener('resize', recalc);
	}, []);

	function onDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over) return;
		const newStatus = over.id as Status;
		const incident = incidents.find((i) => i.id === active.id);
		if (incident && incident.status !== newStatus) {
			update.mutate({ id: incident.id, payload: { status: newStatus } });
		}
	}

	return (
		<DndContext sensors={sensors} onDragEnd={onDragEnd}>
			<div ref={boardRef} style={boardHeight ? { height: boardHeight } : undefined} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{STATUSES.map((status) => (
					<Column key={status} status={status} incidents={incidents.filter((i) => i.status === status)} canDrag={canDrag} />
				))}
			</div>
		</DndContext>
	);
}

function Column({ status, incidents, canDrag }: { status: Status; incidents: Incident[]; canDrag: boolean }) {
	const { setNodeRef, isOver } = useDroppable({ id: status });
	return (
		<div className={`flex max-h-[70vh] min-h-48 flex-col rounded-xl border border-t-4 border-slate-200 bg-slate-50 lg:h-full lg:max-h-none lg:min-h-0 dark:border-slate-800 dark:bg-slate-900/50 ${COLUMN_ACCENT[status]}`}>
			<div className="flex items-center justify-between px-3 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
				<span>{status.replace('_', ' ')}</span>
				<span className="rounded-full bg-slate-200 px-1.5 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{incidents.length}</span>
			</div>
			{/* Only the card list scrolls — the board stays in view even with many cards. */}
			<div ref={setNodeRef} className={`thin-scrollbar flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto rounded-b-xl px-3 pb-3 transition ${isOver ? 'ring-2 ring-inset ring-slate-300 dark:ring-slate-600' : ''}`}>
				{incidents.map((incident) => (
					<Card key={incident.id} incident={incident} canDrag={canDrag} />
				))}
			</div>
		</div>
	);
}

function Card({ incident, canDrag }: { incident: Incident; canDrag: boolean }) {
	const { t } = useTranslation();
	const { density } = useDensity();
	const compact = density === 'compact';
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: incident.id, disabled: !canDrag });
	const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 } : undefined;
	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${compact ? 'p-2' : 'p-3'} ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-50' : ''}`}
		>
			<Link to={`/incidents/${incident.id}`} title={incident.title} className={`line-clamp-2 block font-medium text-slate-900 hover:underline dark:text-slate-100 ${compact ? 'text-xs' : 'text-sm'}`} onPointerDown={(e) => e.stopPropagation()}>
				{incident.title}
			</Link>
			{isOverdue(incident) && (
				<div className={compact ? 'mt-1.5' : 'mt-2'}>
					<OverdueBadge label={t('incidents.overdue')} />
				</div>
			)}
			<div className={`${compact ? 'mt-1.5' : 'mt-2'} flex items-center justify-between`}>
				<PriorityBadge priority={incident.priority} />
				<span className="text-xs text-slate-400 dark:text-slate-500">{incident.type}</span>
			</div>
		</div>
	);
}
