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
					<h1 className="text-2xl font-bold text-slate-900">{t('incidents.title')}</h1>
					<p className="text-sm text-slate-500">{t('incidents.subtitle')}</p>
				</div>
				<Link to="/incidents/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
					+ {t('incidents.new')}
				</Link>
			</div>

			<div className="mb-4 flex flex-wrap items-center gap-3">
				<input
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={t('incidents.searchPlaceholder')}
					className="min-w-56 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
				/>
				<FilterSelect value={status} onChange={(v) => setStatus(v as Status | '')} placeholder={t('incidents.allStatuses')} options={STATUSES} />
				<FilterSelect value={type} onChange={(v) => setType(v as IncidentType | '')} placeholder={t('incidents.allTypes')} options={INCIDENT_TYPES} />
				<FilterSelect value={priority} onChange={(v) => setPriority(v as Priority | '')} placeholder={t('incidents.allPriorities')} options={PRIORITIES} />
				{hasFilters && (
					<button onClick={clearFilters} className="text-sm font-medium text-slate-500 hover:text-slate-900">
						{t('incidents.clear')}
					</button>
				)}
			</div>

			{isLoading && <SkeletonRows />}

			{isError && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
					<p className="text-sm text-red-600">{t('incidents.loadFailed')}</p>
					<button onClick={() => refetch()} className="mt-2 text-sm font-medium text-red-700 underline">
						{t('incidents.tryAgain')}
					</button>
				</div>
			)}

			{!isLoading && !isError && incidents.length === 0 && (
				<div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
					<p className="text-slate-500">{hasFilters ? t('incidents.noMatch') : t('incidents.noneYet')}</p>
					{!hasFilters && (
						<Link to="/incidents/new" className="mt-2 inline-block text-sm font-medium text-slate-900 underline">
							{t('incidents.createFirst')}
						</Link>
					)}
				</div>
			)}

			{incidents.length > 0 && (
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
							<tr>
								<th className="px-4 py-3 font-medium">{t('incidents.col.title')}</th>
								<th className="px-4 py-3 font-medium">{t('incidents.col.type')}</th>
								<th className="px-4 py-3 font-medium">{t('incidents.col.priority')}</th>
								<th className="px-4 py-3 font-medium">{t('incidents.col.status')}</th>
								<th className="px-4 py-3 font-medium">{t('incidents.col.reported')}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{incidents.map((incident) => (
								<tr key={incident.id} className="transition hover:bg-slate-50">
									<td className="px-4 py-3">
										<Link to={`/incidents/${incident.id}`} className="font-medium text-slate-900 hover:underline">
											{incident.title}
										</Link>
									</td>
									<td className="px-4 py-3 text-slate-500">{incident.type}</td>
									<td className="px-4 py-3">
										<PriorityBadge priority={incident.priority} />
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={incident.status} />
									</td>
									<td className="px-4 py-3 text-slate-500">{new Date(incident.createdAt).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{hasNextPage && (
				<div className="mt-4 text-center">
					<button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60">
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
	placeholder: string;
	options: string[];
}

function FilterSelect({ value, onChange, placeholder, options }: FilterSelectProps) {
	return (
		<select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
			<option value="">{placeholder}</option>
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
		<div className="space-y-2">
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
			))}
		</div>
	);
}
