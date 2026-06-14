import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { useDeleteIncident, useIncident, useUpdateIncident } from '@/hooks/use-incidents';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/auth-context';
import { selectableStatuses } from '@/lib/incident-status';
import { StatusBadge, PriorityBadge, OverdueBadge } from '@/components/badges';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CommentThread } from '@/components/comment-thread';
import { Drawer } from '@/components/ui/drawer';
import { Avatar } from '@/components/ui/avatar';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PRIORITIES, isOverdue, type Priority, type Status } from '@/types/incident';

const toOptions = (values: string[]) => values.map((v) => ({ label: v.replace('_', ' '), value: v }));
const toDateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
const fromDateInput = (value: string) => (value ? new Date(`${value}T00:00:00`).toISOString() : null);

type Tab = 'overview' | 'activity' | 'comments';

export function IncidentDetailDrawer({ id, onClose }: { id: string; onClose: () => void }) {
	const { user } = useAuth();
	const { t, i18n } = useTranslation();
	const isAdmin = user?.role === 'ADMIN';
	const [tab, setTab] = useState<Tab>('overview');
	const [confirmOpen, setConfirmOpen] = useState(false);

	const { data: incident, isLoading, isError } = useIncident(id);
	const { data: users } = useUsers(isAdmin);
	const update = useUpdateIncident();
	const remove = useDeleteIncident();

	async function handleDelete() {
		try {
			await remove.mutateAsync(id);
			onClose();
		} catch {
			setConfirmOpen(false);
		}
	}

	const title =
		isLoading || !incident ? (
			t('detail.title')
		) : (
			<div className="flex min-w-0 items-center gap-2">
				<span className="truncate">{incident.title}</span>
				{isOverdue(incident) && <OverdueBadge label={t('incidents.overdue')} />}
			</div>
		);

	const patch = (payload: Parameters<typeof update.mutate>[0]['payload']) => incident && update.mutate({ id, payload: { ...payload, expectedUpdatedAt: incident.updatedAt } });

	return (
		<Drawer open title={title} onClose={onClose} size="xl">
			{isLoading ? (
				<div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" role="status" aria-live="polite" />
			) : isError || !incident ? (
				<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
					{t('incidents.notFound')}
				</div>
			) : (
				<div>
					<div className="mb-4 flex items-center gap-2">
						<StatusBadge status={incident.status} />
						<PriorityBadge priority={incident.priority} />
					</div>

					<div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-800">
						{(['overview', 'activity', 'comments'] as const).map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => setTab(key)}
								aria-current={tab === key}
								className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${tab === key ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
							>
								{t(`detail.tab.${key}`)}
							</button>
						))}
					</div>

					{tab === 'overview' && (
						<div className="flex flex-col gap-5">
							<dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
								<Field label={t('detail.type')} value={incident.type} />
								<div>
									<Dt>{t('detail.reportedBy')}</Dt>
									<dd className="mt-1 text-slate-700 dark:text-slate-300">
										<Avatar name={incident.reporter.fullName} />
									</dd>
								</div>
								<div>
									<Dt>{t('detail.assignee')}</Dt>
									<dd className="mt-1 text-slate-700 dark:text-slate-300">{incident.assignee ? <Avatar name={incident.assignee.fullName} /> : t('detail.unassigned')}</dd>
								</div>
								<Field label={t('detail.created')} value={new Date(incident.createdAt).toLocaleString(i18n.resolvedLanguage)} />
								<Field label={t('detail.dueDate')} value={incident.dueDate ? new Date(incident.dueDate).toLocaleDateString(i18n.resolvedLanguage) : '—'} />
								<Field label={t('detail.resolvedAt')} value={incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString(i18n.resolvedLanguage) : '—'} />
								<div className="sm:col-span-2">
									<Dt>{t('detail.description')}</Dt>
									<dd className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{incident.description || '—'}</dd>
								</div>
							</dl>

							{isAdmin && (
								<div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
									<h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('detail.adminControls')}</h3>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<Select label={t('detail.status')} value={incident.status} disabled={update.isPending} options={toOptions(selectableStatuses(incident.status))} onChange={(v) => patch({ status: v as Status })} />
										<Select label={t('detail.priority')} value={incident.priority} disabled={update.isPending} options={toOptions(PRIORITIES)} onChange={(v) => patch({ priority: v as Priority })} />
										<Select label={t('detail.assignee')} value={incident.assigneeId ?? ''} disabled={update.isPending} options={[{ label: t('detail.unassigned'), value: '' }, ...(users?.map((u) => ({ label: u.fullName, value: u.id })) ?? [])]} onChange={(v) => patch({ assigneeId: v || null })} />
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
									<div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
										<Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
											<Trash2 className="h-4 w-4" />
											{t('detail.delete')}
										</Button>
									</div>
								</div>
							)}
						</div>
					)}

					{tab === 'activity' && <ActivityTimeline incident={incident} />}

					{tab === 'comments' && <CommentThread incidentId={id} />}
				</div>
			)}

			<ConfirmDialog open={confirmOpen} title={t('confirm.deleteTitle')} message={t('confirm.deleteMessage')} confirmLabel={t('confirm.deleteConfirm')} onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} loading={remove.isPending} destructive />
		</Drawer>
	);
}

function ActivityTimeline({ incident }: { incident: NonNullable<ReturnType<typeof useIncident>['data']> }) {
	const { t, i18n } = useTranslation();
	const logs = incident.auditLogs ?? [];
	if (logs.length === 0) return <p className="text-sm text-slate-400 dark:text-slate-500">{t('detail.noActivity')}</p>;
	return (
		<ol className="relative ml-1 border-l border-slate-200 dark:border-slate-800">
			{logs.map((log) => (
				<li key={log.id} className="mb-5 ml-5">
					<span className="bg-brand absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900" aria-hidden="true" />
					<p className="text-sm text-slate-700 dark:text-slate-300">{t('detail.changeEntry', { actor: log.actor.fullName, field: log.field, from: log.oldValue ?? '—', to: log.newValue ?? '—' })}</p>
					<time className="text-xs text-slate-400 dark:text-slate-500">{new Date(log.createdAt).toLocaleString(i18n.resolvedLanguage)}</time>
				</li>
			))}
		</ol>
	);
}

function Dt({ children }: { children: React.ReactNode }) {
	return <dt className="text-xs tracking-wide text-slate-400 uppercase dark:text-slate-500">{children}</dt>;
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<Dt>{label}</Dt>
			<dd className="mt-1 text-slate-700 dark:text-slate-300">{value}</dd>
		</div>
	);
}
