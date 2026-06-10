import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useAddComment, useComments, useDeleteIncident, useIncident, useUpdateIncident } from '@/hooks/use-incidents';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/auth-context';
import { selectableStatuses } from '@/lib/incident-status';
import { StatusBadge, PriorityBadge, OverdueBadge } from '@/components/badges';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PRIORITIES, isOverdue, type Priority, type Status } from '@/types/incident';

const toOptions = (values: string[]) => values.map((v) => ({ label: v.replace('_', ' '), value: v }));

// A native date input wants YYYY-MM-DD; convert to/from the stored ISO timestamp.
const toDateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
const fromDateInput = (value: string) => (value ? new Date(`${value}T00:00:00`).toISOString() : null);

export function IncidentDetailPage() {
	const { id = '' } = useParams();
	const { user } = useAuth();
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const isAdmin = user?.role === 'ADMIN';
	const [confirmOpen, setConfirmOpen] = useState(false);

	const { data: incident, isLoading, isError } = useIncident(id);
	const { data: users } = useUsers(isAdmin);
	const update = useUpdateIncident();
	const remove = useDeleteIncident();

	async function handleDelete() {
		try {
			await remove.mutateAsync(id);
			navigate('/incidents');
		} catch {
			setConfirmOpen(false);
		}
	}

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" role="status" aria-live="polite" />;
	}

	if (isError || !incident) {
		return (
			<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
				{t('incidents.notFound')}
				<Link to="/incidents" className="ml-2 font-medium underline">
					{t('incidents.backToList')}
				</Link>
			</div>
		);
	}

	// Every admin write carries the version we last saw, so a stale edit is rejected (409).
	const patch = (payload: Parameters<typeof update.mutate>[0]['payload']) => update.mutate({ id, payload: { ...payload, expectedUpdatedAt: incident.updatedAt } });

	const assigneeOptions = [{ label: t('detail.unassigned'), value: '' }, ...(users?.map((u) => ({ label: u.fullName, value: u.id })) ?? [])];
	const statusOptions = toOptions(selectableStatuses(incident.status));
	const overdue = isOverdue(incident);

	return (
		<div className="mx-auto max-w-3xl">
			<Link to="/incidents" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:underline dark:text-slate-400">
				<ArrowLeft className="h-4 w-4" />
				{t('incidents.backToList')}
			</Link>

			<div className="mt-3 flex items-start justify-between gap-4">
				<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{incident.title}</h1>
				<div className="flex shrink-0 flex-wrap justify-end gap-2">
					{overdue && <OverdueBadge label={t('incidents.overdue')} />}
					<StatusBadge status={incident.status} />
					<PriorityBadge priority={incident.priority} />
				</div>
			</div>

			<Card className="mt-6 p-6">
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<Field label={t('detail.type')} value={incident.type} />
					<Field label={t('detail.reportedBy')} value={incident.reporter.fullName} />
					<Field label={t('detail.assignee')} value={incident.assignee?.fullName ?? t('detail.unassigned')} />
					<Field label={t('detail.created')} value={new Date(incident.createdAt).toLocaleString(i18n.resolvedLanguage)} />
					<Field label={t('detail.dueDate')} value={incident.dueDate ? new Date(incident.dueDate).toLocaleDateString(i18n.resolvedLanguage) : '—'} />
					<Field label={t('detail.resolvedAt')} value={incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString(i18n.resolvedLanguage) : '—'} />
					<div className="col-span-2">
						<dt className="text-xs tracking-wide text-slate-400 uppercase dark:text-slate-500">{t('detail.description')}</dt>
						<dd className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{incident.description || '—'}</dd>
					</div>
				</dl>
			</Card>

			{isAdmin && (
				<Card className="mt-6 p-6">
					<h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('detail.adminControls')}</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Select label={t('detail.status')} value={incident.status} disabled={update.isPending} options={statusOptions} onChange={(v) => patch({ status: v as Status })} />
						<Select label={t('detail.priority')} value={incident.priority} disabled={update.isPending} options={toOptions(PRIORITIES)} onChange={(v) => patch({ priority: v as Priority })} />
						<Select label={t('detail.assignee')} value={incident.assigneeId ?? ''} disabled={update.isPending} options={assigneeOptions} onChange={(v) => patch({ assigneeId: v || null })} />
						<div className="flex flex-col gap-1">
							<label htmlFor="dueDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
								{t('detail.dueDate')}
							</label>
							<input
								id="dueDate"
								type="date"
								value={toDateInput(incident.dueDate)}
								disabled={update.isPending}
								onChange={(e) => patch({ dueDate: fromDateInput(e.target.value) })}
								className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
							/>
						</div>
					</div>
					{update.isError && (
						<p role="alert" className="mt-3 text-sm text-red-500 dark:text-red-400">
							{t('detail.updateFailed')}
						</p>
					)}

					<div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
						<Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
							<Trash2 className="h-4 w-4" />
							{t('detail.delete')}
						</Button>
					</div>
				</Card>
			)}

			<CommentsSection incidentId={id} />

			<div className="mt-6">
				<h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('detail.activity')}</h2>
				{incident.auditLogs && incident.auditLogs.length > 0 ? (
					<ul className="space-y-2">
						{incident.auditLogs.map((log) => (
							<li key={log.id} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
								{t('detail.changeEntry', { actor: log.actor.fullName, field: log.field, from: log.oldValue ?? '—', to: log.newValue ?? '—' })}
								<span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{new Date(log.createdAt).toLocaleString(i18n.resolvedLanguage)}</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-slate-400 dark:text-slate-500">{t('detail.noActivity')}</p>
				)}
			</div>

			<ConfirmDialog
				open={confirmOpen}
				title={t('confirm.deleteTitle')}
				message={t('confirm.deleteMessage')}
				confirmLabel={t('confirm.deleteConfirm')}
				onConfirm={handleDelete}
				onCancel={() => setConfirmOpen(false)}
				loading={remove.isPending}
				destructive
			/>
		</div>
	);
}

function CommentsSection({ incidentId }: { incidentId: string }) {
	const { t, i18n } = useTranslation();
	const { data: comments, isLoading } = useComments(incidentId);
	const addComment = useAddComment(incidentId);
	const [body, setBody] = useState('');

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = body.trim();
		if (!trimmed) return;
		try {
			await addComment.mutateAsync(trimmed);
			setBody('');
		} catch {
			/* error toast handled in the hook */
		}
	}

	return (
		<div className="mt-6">
			<h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('comments.title')}</h2>

			{isLoading ? (
				<div className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" role="status" aria-live="polite" />
			) : comments && comments.length > 0 ? (
				<ul className="space-y-3">
					{comments.map((c) => (
						<li key={c.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
							<div className="flex items-center justify-between gap-2">
								<span className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.author.fullName}</span>
								<span className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.createdAt).toLocaleString(i18n.resolvedLanguage)}</span>
							</div>
							<p className="mt-1 text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-300">{c.body}</p>
						</li>
					))}
				</ul>
			) : (
				<p className="text-sm text-slate-400 dark:text-slate-500">{t('comments.empty')}</p>
			)}

			<form onSubmit={submit} className="mt-3 flex flex-col gap-2">
				<textarea
					rows={3}
					value={body}
					onChange={(e) => setBody(e.target.value)}
					maxLength={2000}
					placeholder={t('comments.placeholder')}
					aria-label={t('comments.placeholder')}
					className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
				/>
				<Button type="submit" size="sm" className="self-start" loading={addComment.isPending} disabled={!body.trim()}>
					{t('comments.post')}
				</Button>
			</form>
		</div>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-xs tracking-wide text-slate-400 uppercase dark:text-slate-500">{label}</dt>
			<dd className="mt-1 text-slate-700 dark:text-slate-300">{value}</dd>
		</div>
	);
}
