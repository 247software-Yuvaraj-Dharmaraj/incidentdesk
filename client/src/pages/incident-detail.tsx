import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIncident, useUpdateIncident } from '@/hooks/use-incidents';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/auth-context';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { PRIORITIES, STATUSES } from '@/types/incident';

export function IncidentDetailPage() {
	const { id = '' } = useParams();
	const { user } = useAuth();
	const { t } = useTranslation();
	const isAdmin = user?.role === 'ADMIN';

	const { data: incident, isLoading, isError } = useIncident(id);
	const { data: users } = useUsers(isAdmin);
	const update = useUpdateIncident();

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

			<dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 text-sm dark:border-slate-800 dark:bg-slate-900">
				<Field label={t('detail.type')} value={incident.type} />
				<Field label={t('detail.reportedBy')} value={incident.reporter.fullName} />
				<Field label={t('detail.assignee')} value={incident.assignee?.fullName ?? t('detail.unassigned')} />
				<Field label={t('detail.created')} value={new Date(incident.createdAt).toLocaleString()} />
				<div className="col-span-2">
					<dt className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{t('detail.description')}</dt>
					<dd className="mt-1 text-slate-700 dark:text-slate-300">{incident.description || '—'}</dd>
				</div>
			</dl>

			{isAdmin && (
				<div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
					<h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('detail.adminControls')}</h2>
					<div className="grid grid-cols-3 gap-4">
						<Control label={t('detail.status')} value={incident.status} disabled={update.isPending} onChange={(value) => update.mutate({ id, payload: { status: value as typeof incident.status } })} options={STATUSES} />
						<Control label={t('detail.priority')} value={incident.priority} disabled={update.isPending} onChange={(value) => update.mutate({ id, payload: { priority: value as typeof incident.priority } })} options={PRIORITIES} />
						<div className="flex flex-col gap-1">
							<label htmlFor="assignee-select" className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
								{t('detail.assignee')}
							</label>
							<select
								id="assignee-select"
								value={incident.assigneeId ?? ''}
								disabled={update.isPending}
								onChange={(e) => update.mutate({ id, payload: { assigneeId: e.target.value || null } })}
								className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
							>
								<option value="">{t('detail.unassigned')}</option>
								{users?.map((u) => (
									<option key={u.id} value={u.id}>
										{u.fullName}
									</option>
								))}
							</select>
						</div>
					</div>
					{update.isError && (
						<p role="alert" className="mt-3 text-sm text-red-500 dark:text-red-400">
							{t('detail.updateFailed')}
						</p>
					)}
				</div>
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

interface ControlProps {
	label: string;
	value: string;
	options: string[];
	disabled: boolean;
	onChange: (value: string) => void;
}

function Control({ label, value, options, disabled, onChange }: ControlProps) {
	return (
		<div className="flex flex-col gap-1">
			<label className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</label>
			<select
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(e.target.value)}
				aria-label={label}
				className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
			>
				{options.map((opt) => (
					<option key={opt} value={opt}>
						{opt.replace('_', ' ')}
					</option>
				))}
			</select>
		</div>
	);
}
