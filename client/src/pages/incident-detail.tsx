import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDeleteIncident, useIncident, useUpdateIncident } from '@/hooks/use-incidents';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/auth-context';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PRIORITIES, STATUSES, type Priority, type Status } from '@/types/incident';

const toOptions = (values: string[]) => values.map((v) => ({ label: v.replace('_', ' '), value: v }));

export function IncidentDetailPage() {
	const { id = '' } = useParams();
	const { user } = useAuth();
	const { t } = useTranslation();
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

	const assigneeOptions = [{ label: t('detail.unassigned'), value: '' }, ...(users?.map((u) => ({ label: u.fullName, value: u.id })) ?? [])];

	return (
		<div className="mx-auto max-w-3xl">
			<Link to="/incidents" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
				← {t('incidents.backToList')}
			</Link>

			<div className="mt-3 flex items-start justify-between gap-4">
				<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{incident.title}</h1>
				<div className="flex shrink-0 gap-2">
					<StatusBadge status={incident.status} />
					<PriorityBadge priority={incident.priority} />
				</div>
			</div>

			<Card className="mt-6 p-6">
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<Field label={t('detail.type')} value={incident.type} />
					<Field label={t('detail.reportedBy')} value={incident.reporter.fullName} />
					<Field label={t('detail.assignee')} value={incident.assignee?.fullName ?? t('detail.unassigned')} />
					<Field label={t('detail.created')} value={new Date(incident.createdAt).toLocaleString()} />
					<div className="col-span-2">
						<dt className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{t('detail.description')}</dt>
						<dd className="mt-1 text-slate-700 dark:text-slate-300">{incident.description || '—'}</dd>
					</div>
				</dl>
			</Card>

			{isAdmin && (
				<Card className="mt-6 p-6">
					<h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('detail.adminControls')}</h2>
					<div className="grid grid-cols-3 gap-4">
						<Select label={t('detail.status')} value={incident.status} disabled={update.isPending} options={toOptions(STATUSES)} onChange={(e) => update.mutate({ id, payload: { status: e.target.value as Status } })} />
						<Select label={t('detail.priority')} value={incident.priority} disabled={update.isPending} options={toOptions(PRIORITIES)} onChange={(e) => update.mutate({ id, payload: { priority: e.target.value as Priority } })} />
						<Select label={t('detail.assignee')} value={incident.assigneeId ?? ''} disabled={update.isPending} options={assigneeOptions} onChange={(e) => update.mutate({ id, payload: { assigneeId: e.target.value || null } })} />
					</div>
					{update.isError && (
						<p role="alert" className="mt-3 text-sm text-red-500 dark:text-red-400">
							{t('detail.updateFailed')}
						</p>
					)}

					<div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
						<Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
							{t('detail.delete')}
						</Button>
					</div>
				</Card>
			)}

			<div className="mt-6">
				<h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('detail.activity')}</h2>
				{incident.auditLogs && incident.auditLogs.length > 0 ? (
					<ul className="space-y-2">
						{incident.auditLogs.map((log) => (
							<li key={log.id} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
								{t('detail.changeEntry', { actor: log.actor.fullName, field: log.field, from: log.oldValue ?? '—', to: log.newValue ?? '—' })}
								<span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
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

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
			<dd className="mt-1 text-slate-700 dark:text-slate-300">{value}</dd>
		</div>
	);
}
