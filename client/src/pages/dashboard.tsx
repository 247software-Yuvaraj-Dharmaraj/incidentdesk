import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useIncidentStats } from '@/hooks/use-incidents';

const CARDS: { key: 'total' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; label: string; accent: string }[] = [
	{ key: 'total', label: 'Total', accent: 'text-slate-900' },
	{ key: 'OPEN', label: 'Open', accent: 'text-blue-600' },
	{ key: 'IN_PROGRESS', label: 'In progress', accent: 'text-amber-600' },
	{ key: 'RESOLVED', label: 'Resolved', accent: 'text-green-600' },
];

export function DashboardPage() {
	const { user } = useAuth();
	const { data: stats, isLoading } = useIncidentStats();

	function valueFor(key: (typeof CARDS)[number]['key']) {
		if (!stats) return 0;
		return key === 'total' ? stats.total : stats.byStatus[key];
	}

	return (
		<div>
			<h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
			<p className="mt-1 text-sm text-slate-500">
				Welcome, {user?.fullName} · <span className="font-medium text-slate-700">{user?.role}</span>
			</p>

			<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{CARDS.map((card) => (
					<div key={card.key} className="rounded-xl border border-slate-200 bg-white p-5">
						<p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
						{isLoading ? <div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-100" /> : <p className={`mt-1 text-3xl font-bold ${card.accent}`}>{valueFor(card.key)}</p>}
					</div>
				))}
			</div>

			<Link to="/incidents" className="mt-6 inline-block text-sm font-medium text-slate-900 hover:underline">
				View all incidents →
			</Link>
		</div>
	);
}
