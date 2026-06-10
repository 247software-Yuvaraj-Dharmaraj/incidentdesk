import { useEffect, useMemo, useState } from 'react';
import { Link, useMatch, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createColumnHelper, type RowSelectionState } from '@tanstack/react-table';
import { Download, LayoutGrid, Pencil, Plus, Search, Table2, Trash2, X } from 'lucide-react';
import { useBulkDelete, useBulkUpdate, useDeleteIncident, useIncidents } from '@/hooks/use-incidents';
import { useDebounce } from '@/hooks/use-debounce';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/auth-context';
import { exportIncidentsCsv } from '@/lib/export-csv';
import { StatusBadge, PriorityBadge, OverdueBadge } from '@/components/badges';
import { IncidentBoard } from '@/components/incident-board';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { DataGrid } from '@/components/ui/data-grid';
import { Select } from '@/components/ui/select';
import { Button, buttonClasses } from '@/components/ui/button';
import { ActionMenu } from '@/components/ui/action-menu';
import { SelectionBar } from '@/components/ui/selection-bar';
import { IncidentDetailDrawer } from '@/components/incident-detail-drawer';
import { IncidentCreateDrawer } from '@/components/incident-create-drawer';
import { INCIDENT_TYPES, PRIORITIES, STATUSES, isOverdue, type Incident, type IncidentFilters, type IncidentType, type Priority, type Status } from '@/types/incident';

const PRIORITY_RANK: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
const STATUS_RANK: Record<Status, number> = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };

const columnHelper = createColumnHelper<Incident>();
const toOptions = (values: string[]) => values.map((v) => ({ label: v.replace('_', ' '), value: v }));

type View = 'table' | 'board';

export function IncidentsListPage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const isNew = Boolean(useMatch('/incidents/new'));
	const { id: detailId } = useParams();
	const { user } = useAuth();
	const isAdmin = user?.role === 'ADMIN';

	const [view, setView] = useState<View>(() => (localStorage.getItem('incidents-view') === 'board' ? 'board' : 'table'));
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<Status | ''>('');
	const [type, setType] = useState<IncidentType | ''>('');
	const [priority, setPriority] = useState<Priority | ''>('');
	const [assigneeId, setAssigneeId] = useState('');
	const [overdue, setOverdue] = useState(false);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

	const debouncedSearch = useDebounce(search, 300);
	const { data: users } = useUsers(isAdmin);
	const remove = useDeleteIncident();
	const bulkUpdate = useBulkUpdate();
	const bulkDelete = useBulkDelete();
	const selectedIds = Object.keys(rowSelection);

	const filters = useMemo<IncidentFilters>(
		() => ({
			...(debouncedSearch ? { q: debouncedSearch } : {}),
			...(status ? { status } : {}),
			...(type ? { type } : {}),
			...(priority ? { priority } : {}),
			...(assigneeId ? { assigneeId } : {}),
			...(overdue ? { overdue: true } : {}),
		}),
		[debouncedSearch, status, type, priority, assigneeId, overdue]
	);

	const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useIncidents(filters);
	const incidents = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
	const total = data?.pages[0]?.total ?? 0;
	const hasFilters = Boolean(debouncedSearch || status || type || priority || assigneeId || overdue);

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
					<div className="flex items-center gap-2">
						<Link to={`/incidents/${info.row.original.id}`} title={info.getValue()} className="block max-w-xs truncate font-medium text-slate-900 hover:underline dark:text-slate-100">
							{info.getValue()}
						</Link>
						{isOverdue(info.row.original) && <OverdueBadge label={t('incidents.overdue')} />}
					</div>
				),
			}),
			columnHelper.accessor('type', { header: t('incidents.col.type'), cell: (info) => <span className="text-slate-500 dark:text-slate-400">{info.getValue()}</span> }),
			columnHelper.accessor((row) => PRIORITY_RANK[row.priority], { id: 'priority', header: t('incidents.col.priority'), cell: (info) => <PriorityBadge priority={info.row.original.priority} /> }),
			columnHelper.accessor((row) => STATUS_RANK[row.status], { id: 'status', header: t('incidents.col.status'), cell: (info) => <StatusBadge status={info.row.original.status} /> }),
			columnHelper.accessor((row) => new Date(row.createdAt).getTime(), { id: 'reported', header: t('incidents.col.reported'), cell: (info) => <span className="text-slate-500 dark:text-slate-400">{new Date(info.row.original.createdAt).toLocaleDateString(i18n.resolvedLanguage)}</span> }),
			...(isAdmin
				? [
						columnHelper.display({
							id: 'actions',
							header: () => <span className="sr-only">{t('incidents.col.actions')}</span>,
							cell: (info) => (
								<div className="flex justify-end">
									<ActionMenu
										label={t('incidents.col.actions')}
										items={[
											{ key: 'edit', label: t('common.edit'), icon: <Pencil className="h-4 w-4" />, onSelect: () => navigate(`/incidents/${info.row.original.id}`) },
											{ key: 'delete', label: t('common.delete'), icon: <Trash2 className="h-4 w-4" />, destructive: true, onSelect: () => setConfirmDeleteId(info.row.original.id) },
										]}
									/>
								</div>
							),
						}),
					]
				: []),
		],
		[t, i18n.resolvedLanguage, isAdmin, navigate]
	);

	function clearFilters() {
		setSearch('');
		setStatus('');
		setType('');
		setPriority('');
		setAssigneeId('');
		setOverdue(false);
	}

	async function handleDelete() {
		if (!confirmDeleteId) return;
		try {
			await remove.mutateAsync(confirmDeleteId);
		} finally {
			setConfirmDeleteId(null);
		}
	}

	function clearSelection() {
		setRowSelection({});
	}

	async function applyBulk(payload: { status?: Status; assigneeId?: string | null }) {
		await bulkUpdate.mutateAsync({ ids: selectedIds, ...payload });
		clearSelection();
	}

	async function handleBulkDelete() {
		try {
			await bulkDelete.mutateAsync(selectedIds);
			clearSelection();
		} finally {
			setConfirmBulkDelete(false);
		}
	}

	const assigneeOptions = [{ label: t('detail.unassigned'), value: 'unassigned' }, ...(users?.map((u) => ({ label: u.fullName, value: u.id })) ?? [])];

	// Active-filter chips (removable). Each entry resets its own filter on click.
	const chips: { key: string; label: string; clear: () => void }[] = [
		debouncedSearch ? { key: 'q', label: `"${debouncedSearch}"`, clear: () => setSearch('') } : null,
		status ? { key: 'status', label: status.replace('_', ' '), clear: () => setStatus('') } : null,
		type ? { key: 'type', label: type, clear: () => setType('') } : null,
		priority ? { key: 'priority', label: priority, clear: () => setPriority('') } : null,
		assigneeId ? { key: 'assignee', label: assigneeOptions.find((o) => o.value === assigneeId)?.label ?? assigneeId, clear: () => setAssigneeId('') } : null,
		overdue ? { key: 'overdue', label: t('incidents.overdue'), clear: () => setOverdue(false) } : null,
	].filter((c): c is { key: string; label: string; clear: () => void } => c !== null);

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
										className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition ${view === v ? 'bg-brand text-brand-fg' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
									>
										<Icon className="h-4 w-4" />
										{t(v === 'table' ? 'incidents.viewTable' : 'incidents.viewBoard')}
									</button>
								);
							})}
						</div>
						<Button variant="secondary" size="md" onClick={() => exportIncidentsCsv(incidents)} disabled={incidents.length === 0}>
							<Download className="h-4 w-4" />
							{t('incidents.export')}
						</Button>
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
				<Select value={status} onChange={(v) => setStatus(v as Status | '')} placeholder={t('incidents.allStatuses')} options={toOptions(STATUSES)} className="min-w-40" />
				<Select value={type} onChange={(v) => setType(v as IncidentType | '')} placeholder={t('incidents.allTypes')} options={toOptions(INCIDENT_TYPES)} className="min-w-40" />
				<Select value={priority} onChange={(v) => setPriority(v as Priority | '')} placeholder={t('incidents.allPriorities')} options={toOptions(PRIORITIES)} className="min-w-40" />
				{isAdmin && <Select value={assigneeId} onChange={(v) => setAssigneeId(v)} placeholder={t('incidents.allAssignees')} options={assigneeOptions} className="min-w-44" />}
				<button
					type="button"
					onClick={() => setOverdue((v) => !v)}
					aria-pressed={overdue}
					className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${overdue ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300' : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}`}
				>
					{t('incidents.overdueOnly')}
				</button>
				{hasFilters && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						{t('incidents.clear')}
					</Button>
				)}
			</div>

			{chips.length > 0 && (
				<div className="mb-4 flex flex-wrap items-center gap-2">
					{chips.map((chip) => (
						<button
							key={chip.key}
							type="button"
							onClick={chip.clear}
							className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							{chip.label}
							<X className="h-3 w-3" aria-hidden="true" />
						</button>
					))}
				</div>
			)}

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

			{incidents.length > 0 && (
				<>
					<p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{t('incidents.showing', { shown: incidents.length, total })}</p>
					{isAdmin && view === 'table' && (
						<SelectionBar count={selectedIds.length} onClear={clearSelection}>
							<Select aria-label={t('incidents.bulkStatus')} value="" placeholder={t('incidents.bulkStatus')} options={toOptions(STATUSES)} disabled={bulkUpdate.isPending} onChange={(v) => v && applyBulk({ status: v as Status })} className="min-w-36" />
							<Select aria-label={t('incidents.bulkAssign')} value="" placeholder={t('incidents.bulkAssign')} options={assigneeOptions} disabled={bulkUpdate.isPending} onChange={(v) => v && applyBulk({ assigneeId: v === 'unassigned' ? null : v })} className="min-w-36" />
							<Button variant="danger" size="sm" onClick={() => setConfirmBulkDelete(true)} loading={bulkDelete.isPending}>
								<Trash2 className="h-4 w-4" />
								{t('common.delete')}
							</Button>
						</SelectionBar>
					)}
					{view === 'board' ? <IncidentBoard incidents={incidents} canDrag={isAdmin} /> : <DataGrid columns={columns} data={incidents} {...(isAdmin ? { getRowId: (r: Incident) => r.id, rowSelection, onRowSelectionChange: setRowSelection } : {})} />}
				</>
			)}

			{view === 'table' && hasNextPage && (
				<div className="mt-4 text-center">
					<Button variant="secondary" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
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

			<ConfirmDialog
				open={confirmBulkDelete}
				title={t('confirm.deleteTitle')}
				message={t('confirm.bulkDeleteMessage', { count: selectedIds.length })}
				confirmLabel={t('confirm.deleteConfirm')}
				onConfirm={handleBulkDelete}
				onCancel={() => setConfirmBulkDelete(false)}
				loading={bulkDelete.isPending}
				destructive
			/>

			{isNew && <IncidentCreateDrawer onClose={() => navigate('/incidents')} onCreated={(id) => navigate(`/incidents/${id}`)} />}
			{detailId && <IncidentDetailDrawer id={detailId} onClose={() => navigate('/incidents')} />}
		</div>
	);
}

function SkeletonRows() {
	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" role="status" aria-live="polite" aria-busy="true">
			<div className="h-10 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50" />
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3.5 last:border-0 dark:border-slate-800">
					<div className="h-4 flex-1 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
					<div className="h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
					<div className="h-5 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
					<div className="h-5 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
					<div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
				</div>
			))}
		</div>
	);
}
