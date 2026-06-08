import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table';
import { useIncidents } from '@/hooks/use-incidents';
import { useDebounce } from '@/hooks/use-debounce';
import { useDensity } from '@/context/density-context';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { INCIDENT_TYPES, PRIORITIES, STATUSES, type Incident, type IncidentFilters, type IncidentType, type Priority, type Status } from '@/types/incident';

const PRIORITY_RANK: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
const STATUS_RANK: Record<Status, number> = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };

const columnHelper = createColumnHelper<Incident>();

export function IncidentsListPage() {
	const { t } = useTranslation();
	const { density } = useDensity();
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<Status | ''>('');
	const [type, setType] = useState<IncidentType | ''>('');
	const [priority, setPriority] = useState<Priority | ''>('');
	const [sorting, setSorting] = useState<SortingState>([]);

	const debouncedSearch = useDebounce(search, 300);

	const filters = useMemo<IncidentFilters>(
		() => ({
			...(debouncedSearch ? { q: debouncedSearch } : {}),
			...(status ? { status } : {}),
			...(type ? { type } : {}),
			...(priority ? { priority } : {}),
		}),
		[debouncedSearch, status, type, priority]
	);

	const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useIncidents(filters);
	const incidents = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
	const hasFilters = Boolean(debouncedSearch || status || type || priority);

	const columns = useMemo(
		() => [
			columnHelper.accessor('title', {
				header: t('incidents.col.title'),
				cell: (info) => (
					<Link to={`/incidents/${info.row.original.id}`} className="font-medium text-slate-900 hover:underline dark:text-slate-100">
						{info.getValue()}
					</Link>
				),
			}),
			columnHelper.accessor('type', { header: t('incidents.col.type'), cell: (info) => <span className="text-slate-500 dark:text-slate-400">{info.getValue()}</span> }),
			columnHelper.accessor((row) => PRIORITY_RANK[row.priority], {
				id: 'priority',
				header: t('incidents.col.priority'),
				cell: (info) => <PriorityBadge priority={info.row.original.priority} />,
			}),
			columnHelper.accessor((row) => STATUS_RANK[row.status], {
				id: 'status',
				header: t('incidents.col.status'),
				cell: (info) => <StatusBadge status={info.row.original.status} />,
			}),
			columnHelper.accessor((row) => new Date(row.createdAt).getTime(), {
				id: 'reported',
				header: t('incidents.col.reported'),
				cell: (info) => <span className="text-slate-500 dark:text-slate-400">{new Date(info.row.original.createdAt).toLocaleDateString()}</span>,
			}),
		],
		[t]
	);

	const table = useReactTable({
		data: incidents,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function clearFilters() {
		setSearch('');
		setStatus('');
		setType('');
		setPriority('');
	}

	const cellPad = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('incidents.title')}</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400">{t('incidents.subtitle')}</p>
				</div>
				<Link
					to="/incidents/new"
					className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
				>
					+ {t('incidents.new')}
				</Link>
			</div>

			<div className="mb-4 flex flex-wrap items-center gap-3">
				<input
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={t('incidents.searchPlaceholder')}
					aria-label={t('incidents.searchPlaceholder')}
					className="min-w-48 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
				/>
				<FilterSelect value={status} onChange={(v) => setStatus(v as Status | '')} label={t('incidents.allStatuses')} options={STATUSES} />
				<FilterSelect value={type} onChange={(v) => setType(v as IncidentType | '')} label={t('incidents.allTypes')} options={INCIDENT_TYPES} />
				<FilterSelect value={priority} onChange={(v) => setPriority(v as Priority | '')} label={t('incidents.allPriorities')} options={PRIORITIES} />
				{hasFilters && (
					<button type="button" onClick={clearFilters} className="text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:underline focus-visible:outline-none dark:text-slate-400 dark:hover:text-slate-100">
						{t('incidents.clear')}
					</button>
				)}
			</div>

			{isLoading && <SkeletonRows />}

			{isError && (
				<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
					<p className="text-sm text-red-600 dark:text-red-400">{t('incidents.loadFailed')}</p>
					<button type="button" onClick={() => refetch()} className="mt-2 text-sm font-medium text-red-700 underline dark:text-red-300">
						{t('incidents.tryAgain')}
					</button>
				</div>
			)}

			{!isLoading && !isError && incidents.length === 0 && (
				<div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
					<p className="text-slate-500 dark:text-slate-400">{hasFilters ? t('incidents.noMatch') : t('incidents.noneYet')}</p>
					{!hasFilters && (
						<Link to="/incidents/new" className="mt-2 inline-block text-sm font-medium text-slate-900 underline dark:text-slate-100">
							{t('incidents.createFirst')}
						</Link>
					)}
				</div>
			)}

			{incidents.length > 0 && (
				<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
					<table className="w-full min-w-[640px] text-left text-sm">
						<thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										const sorted = header.column.getIsSorted();
										return (
											<th key={header.id} scope="col" aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'} className={`${cellPad} font-medium`}>
												<button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 uppercase hover:text-slate-700 focus-visible:underline focus-visible:outline-none dark:hover:text-slate-200">
													{flexRender(header.column.columnDef.header, header.getContext())}
													<span aria-hidden="true" className="text-[10px]">
														{sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}
													</span>
												</button>
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
							{table.getRowModel().rows.map((row) => (
								<tr key={row.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className={cellPad}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{hasNextPage && (
				<div className="mt-4 text-center">
					<button
						type="button"
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						{isFetchingNextPage ? t('common.loading') : t('incidents.loadMore')}
					</button>
				</div>
			)}
		</div>
	);
}

interface FilterSelectProps {
	value: string;
	onChange: (value: string) => void;
	label: string;
	options: string[];
}

function FilterSelect({ value, onChange, label, options }: FilterSelectProps) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			aria-label={label}
			className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
		>
			<option value="">{label}</option>
			{options.map((opt) => (
				<option key={opt} value={opt}>
					{opt.replace('_', ' ')}
				</option>
			))}
		</select>
	);
}

function SkeletonRows() {
	return (
		<div className="space-y-2" role="status" aria-live="polite">
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
			))}
		</div>
	);
}
