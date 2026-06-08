import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/auth-context';
import { useIncidentStats } from '@/hooks/use-incidents';

const CARDS: { key: 'total' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; labelKey: string; accent: string }[] = [
	{ key: 'total', labelKey: 'dashboard.total', accent: 'text-slate-900 dark:text-slate-100' },
	{ key: 'OPEN', labelKey: 'dashboard.open', accent: 'text-blue-600 dark:text-blue-400' },
	{ key: 'IN_PROGRESS', labelKey: 'dashboard.inProgress', accent: 'text-amber-600 dark:text-amber-400' },
	{ key: 'RESOLVED', labelKey: 'dashboard.resolved', accent: 'text-green-600 dark:text-green-400' },
];

export function DashboardPage() {
	const { user } = useAuth();
	const { t } = useTranslation();
	const { data: stats, isLoading } = useIncidentStats();

	function valueFor(key: (typeof CARDS)[number]['key']) {
		if (!stats) return 0;
		return key === 'total' ? stats.total : stats.byStatus[key];
	}

	return (
		<div>
			<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.title')}</h1>
			<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
				{t('dashboard.welcome', { name: user?.fullName })} · <span className="font-medium text-slate-700 dark:text-slate-300">{user?.role}</span>
			</p>

			<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{CARDS.map((card) => (
					<div key={card.key} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
						<p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{t(card.labelKey)}</p>
						{isLoading ? <div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <p className={`mt-1 text-3xl font-bold ${card.accent}`}>{valueFor(card.key)}</p>}
					</div>
				))}
			</div>

			<Link to="/incidents" className="mt-6 inline-block text-sm font-medium text-slate-900 hover:underline dark:text-slate-100">
				{t('dashboard.viewAll')}
			</Link>
		</div>
	);
}
