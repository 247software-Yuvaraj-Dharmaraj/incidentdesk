import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIncidents } from '@/hooks/use-incidents';
import { useDebounce } from '@/hooks/use-debounce';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { INCIDENT_TYPES, PRIORITIES, STATUSES, type IncidentFilters, type IncidentType, type Priority, type Status } from '@/types/incident';

export function IncidentsListPage() {
	const { t } = useTranslation();
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<Status | ''>('');
	const [type, setType] = useState<IncidentType | ''>('');
	const [priority, setPriority] = useState<Priority | ''>('');

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

	const incidents = data?.pages.flatMap((page) => page.items) ?? [];
	const hasFilters = Boolean(debouncedSearch || status || type || priority);

	function clearFilters() {
		setSearch('');
		setStatus('');
		setType('');
		setPriority('');
	}

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('incidents.title')}</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400">{t('incidents.subtitle')}</p>
				</div>
				<Link
					to="/incidents/new"
					className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
					className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
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
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">{t('incidents.col.title')}</th>
								<th scope="col" className="px-4 py-3 font-medium">{t('incidents.col.type')}</th>
								<th scope="col" className="px-4 py-3 font-medium">{t('incidents.col.priority')}</th>
								<th scope="col" className="px-4 py-3 font-medium">{t('incidents.col.status')}</th>
								<th scope="col" className="px-4 py-3 font-medium">{t('incidents.col.reported')}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
							{incidents.map((incident) => (
								<tr key={incident.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
									<td className="px-4 py-3">
										<Link to={`/incidents/${incident.id}`} className="font-medium text-slate-900 hover:underline dark:text-slate-100">
											{incident.title}
										</Link>
									</td>
									<td className="px-4 py-3 text-slate-500 dark:text-slate-400">{incident.type}</td>
									<td className="px-4 py-3">
										<PriorityBadge priority={incident.priority} />
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={incident.status} />
									</td>
									<td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(incident.createdAt).toLocaleDateString()}</td>
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
