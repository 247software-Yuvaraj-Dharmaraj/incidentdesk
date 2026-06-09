import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/react-table';
import { LayoutGrid, Pencil, Plus, Search, Table2, Trash2 } from 'lucide-react';
import { useDeleteIncident, useIncidents } from '@/hooks/use-incidents';
import { useDebounce } from '@/hooks/use-debounce';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/auth-context';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { IncidentBoard } from '@/components/incident-board';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { DataGrid } from '@/components/ui/data-grid';
import { Select } from '@/components/ui/select';
import { Button, buttonClasses } from '@/components/ui/button';
import { INCIDENT_TYPES, PRIORITIES, STATUSES, type Incident, type IncidentFilters, type IncidentType, type Priority, type Status } from '@/types/incident';

const PRIORITY_RANK: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
const STATUS_RANK: Record<Status, number> = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };

const columnHelper = createColumnHelper<Incident>();
const toOptions = (values: string[]) => values.map((v) => ({ label: v.replace('_', ' '), value: v }));

type View = 'table' | 'board';

export function IncidentsListPage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const isAdmin = user?.role === 'ADMIN';

	const [view, setView] = useState<View>(() => (localStorage.getItem('incidents-view') === 'board' ? 'board' : 'table'));
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<Status | ''>('');
	const [type, setType] = useState<IncidentType | ''>('');
	const [priority, setPriority] = useState<Priority | ''>('');
	const [assigneeId, setAssigneeId] = useState('');
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	const debouncedSearch = useDebounce(search, 300);
	const { data: users } = useUsers(isAdmin);
	const remove = useDeleteIncident();

	const filters = useMemo<IncidentFilters>(
		() => ({
			...(debouncedSearch ? { q: debouncedSearch } : {}),
			...(status ? { status } : {}),
			...(type ? { type } : {}),
			...(priority ? { priority } : {}),
			...(assigneeId ? { assigneeId } : {}),
		}),
		[debouncedSearch, status, type, priority, assigneeId]
	);

	const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useIncidents(filters);
	const incidents = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
	const hasFilters = Boolean(debouncedSearch || status || type || priority || assigneeId);

	useEffect(() => {
		localStorage.setItem('incidents-view', view);
	}, [view]);

	useEffect(() => {
		if (view === 'board' && hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, [view, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
			columnHelper.accessor((row) => PRIORITY_RANK[row.priority], { id: 'priority', header: t('incidents.col.priority'), cell: (info) => <PriorityBadge priority={info.row.original.priority} /> }),
			columnHelper.accessor((row) => STATUS_RANK[row.status], { id: 'status', header: t('incidents.col.status'), cell: (info) => <StatusBadge status={info.row.original.status} /> }),
			columnHelper.accessor((row) => new Date(row.createdAt).getTime(), { id: 'reported', header: t('incidents.col.reported'), cell: (info) => <span className="text-slate-500 dark:text-slate-400">{new Date(info.row.original.createdAt).toLocaleDateString()}</span> }),
			...(isAdmin
				? [
						columnHelper.display({
							id: 'actions',
							header: t('incidents.col.actions'),
							cell: (info) => (
								<div className="flex gap-1">
									<Link
										to={`/incidents/${info.row.original.id}`}
										aria-label={t('common.edit')}
										title={t('common.edit')}
										className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
									>
										<Pencil className="h-4 w-4" />
									</Link>
									<button
										type="button"
										onClick={() => setConfirmDeleteId(info.row.original.id)}
										aria-label={t('common.delete')}
										title={t('common.delete')}
										className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-red-950 dark:hover:text-red-400"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							),
						}),
					]
				: []),
		],
		[t, isAdmin]
	);

	function clearFilters() {
		setSearch('');
		setStatus('');
		setType('');
		setPriority('');
		setAssigneeId('');
	}

	async function handleDelete() {
		if (!confirmDeleteId) return;
		try {
			await remove.mutateAsync(confirmDeleteId);
		} finally {
			setConfirmDeleteId(null);
		}
	}

	const assigneeOptions = [{ label: t('detail.unassigned'), value: 'unassigned' }, ...(users?.map((u) => ({ label: u.fullName, value: u.id })) ?? [])];

	return (
		<div>
			<PageHeader
				title={t('incidents.title')}
				subtitle={t('incidents.subtitle')}
				actions={
					<>
						<div className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-sm dark:border-slate-700">
							{(['table', 'board'] as const).map((v) => {
								const Icon = v === 'table' ? Table2 : LayoutGrid;
								return (
									<button
										key={v}
										type="button"
										onClick={() => setView(v)}
										aria-pressed={view === v}
										className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition ${view === v ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
									>
										<Icon className="h-4 w-4" />
										{t(v === 'table' ? 'incidents.viewTable' : 'incidents.viewBoard')}
									</button>
								);
							})}
						</div>
						<Link to="/incidents/new" className={buttonClasses('primary')}>
							<Plus className="h-4 w-4" />
							{t('incidents.new')}
						</Link>
					</>
				}
			/>

			<div className="mb-4 flex flex-wrap items-center gap-3">
				<div className="relative min-w-48 flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
					<input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder={t('incidents.searchPlaceholder')}
						aria-label={t('incidents.searchPlaceholder')}
						className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
					/>
				</div>
				<Select value={status} onChange={(e) => setStatus(e.target.value as Status | '')} placeholder={t('incidents.allStatuses')} options={toOptions(STATUSES)} />
				<Select value={type} onChange={(e) => setType(e.target.value as IncidentType | '')} placeholder={t('incidents.allTypes')} options={toOptions(INCIDENT_TYPES)} />
				<Select value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')} placeholder={t('incidents.allPriorities')} options={toOptions(PRIORITIES)} />
				{isAdmin && <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} placeholder={t('incidents.allAssignees')} options={assigneeOptions} />}
				{hasFilters && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						{t('incidents.clear')}
					</Button>
				)}
			</div>

			{isLoading && <SkeletonRows />}

			{isError && (
				<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
					<p className="text-sm text-red-600 dark:text-red-400">{t('incidents.loadFailed')}</p>
					<Button variant="ghost" size="sm" onClick={() => refetch()} className="mt-2 text-red-700 dark:text-red-300">
						{t('incidents.tryAgain')}
					</Button>
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

			{incidents.length > 0 && (view === 'board' ? <IncidentBoard incidents={incidents} canDrag={isAdmin} /> : <DataGrid columns={columns} data={incidents} />)}

			{view === 'table' && hasNextPage && (
				<div className="mt-4 text-center">
					<Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
						{isFetchingNextPage ? t('common.loading') : t('incidents.loadMore')}
					</Button>
				</div>
			)}

			<ConfirmDialog
				open={confirmDeleteId !== null}
				title={t('confirm.deleteTitle')}
				message={t('confirm.deleteMessage')}
				confirmLabel={t('confirm.deleteConfirm')}
				onConfirm={handleDelete}
				onCancel={() => setConfirmDeleteId(null)}
				loading={remove.isPending}
				destructive
			/>
		</div>
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
