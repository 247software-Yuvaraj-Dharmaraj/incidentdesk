import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/auth-context';
import { useDensity } from '@/context/density-context';
import { useIncidentMetrics, useIncidentStats } from '@/hooks/use-incidents';
import { Card } from '@/components/ui/card';
import { TrendChart } from '@/components/trend-chart';

const CARDS: { key: 'total' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; labelKey: string; accent: string }[] = [
	{ key: 'total', labelKey: 'dashboard.total', accent: 'text-slate-900 dark:text-slate-100' },
	{ key: 'OPEN', labelKey: 'dashboard.open', accent: 'text-blue-600 dark:text-blue-400' },
	{ key: 'IN_PROGRESS', labelKey: 'dashboard.inProgress', accent: 'text-amber-600 dark:text-amber-400' },
	{ key: 'RESOLVED', labelKey: 'dashboard.resolved', accent: 'text-green-600 dark:text-green-400' },
];

function formatMttr(hours: number | null): string | null {
	if (hours === null) return null;
	if (hours < 1) return `${Math.round(hours * 60)}m`;
	if (hours < 48) return `${hours.toFixed(1)}h`;
	return `${(hours / 24).toFixed(1)}d`;
}

export function DashboardPage() {
	const { user } = useAuth();
	const { t } = useTranslation();
	const { density } = useDensity();
	const compact = density === 'compact';
	const cardPad = compact ? 'p-4' : 'p-5';
	const gridGap = compact ? 'gap-3' : 'gap-4';
	const valueText = compact ? 'text-2xl' : 'text-3xl';
	const { data: stats, isLoading } = useIncidentStats();
	const { data: metrics } = useIncidentMetrics();

	function valueFor(key: (typeof CARDS)[number]['key']) {
		if (!stats) return 0;
		return key === 'total' ? stats.total : stats.byStatus[key];
	}

	const isEmpty = !isLoading && stats?.total === 0;
	const mttr = formatMttr(metrics?.mttrHours ?? null);

	return (
		<div>
			<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('dashboard.title')}</h1>
			<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
				{t('dashboard.welcome', { name: user?.fullName })} · <span className="font-medium text-slate-700 dark:text-slate-300">{user?.role}</span>
			</p>

			{isEmpty ? (
				<Card className="mt-6 flex flex-col items-center gap-2 p-12 text-center">
					<p className="font-medium text-slate-700 dark:text-slate-200">{t('dashboard.emptyTitle')}</p>
					<p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.emptyHint')}</p>
					<Link to="/incidents/new" className="mt-2 text-sm font-medium text-slate-900 underline dark:text-slate-100">
						{t('incidents.createFirst')}
					</Link>
				</Card>
			) : (
				<>
					<div className={`mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 ${gridGap}`}>
						{CARDS.map((card) => (
							<Card key={card.key} className={cardPad}>
								<p className="text-xs tracking-wide text-slate-400 uppercase dark:text-slate-500">{t(card.labelKey)}</p>
								{isLoading ? <div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <p className={`mt-1 font-bold tracking-tight tabular-nums ${valueText} ${card.accent}`}>{valueFor(card.key)}</p>}
							</Card>
						))}
						<Card className={cardPad}>
							<p className="text-xs tracking-wide text-slate-400 uppercase dark:text-slate-500">{t('dashboard.mttr')}</p>
							<p className={`text-brand mt-1 font-bold tracking-tight tabular-nums ${valueText}`}>{mttr ?? '—'}</p>
						</Card>
					</div>

					{metrics && metrics.trend.length > 0 && (
						<Card className={`mt-6 ${compact ? 'p-4' : 'p-6'}`}>
							<h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('dashboard.trend')}</h2>
							<TrendChart data={metrics.trend} createdLabel={t('dashboard.created')} resolvedLabel={t('dashboard.resolved')} />
						</Card>
					)}

					<Link to="/incidents" className="mt-6 inline-block text-sm font-medium text-slate-900 hover:underline dark:text-slate-100">
						{t('dashboard.viewAll')}
					</Link>
				</>
			)}
		</div>
	);
}
