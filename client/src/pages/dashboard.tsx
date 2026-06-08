import { useAuth } from '@/context/auth-context';

export function DashboardPage() {
	const { user } = useAuth();

	return (
		<div>
			<h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
			<p className="mt-2 text-slate-500">
				Welcome, {user?.fullName}. You are signed in as <span className="font-medium text-slate-700">{user?.role}</span>.
			</p>
			<div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">Incident management coming in the next phase.</div>
		</div>
	);
}
