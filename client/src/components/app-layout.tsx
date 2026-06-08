import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';

export function AppLayout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	async function handleLogout() {
		await logout();
		navigate('/login');
	}

	return (
		<div className="min-h-screen bg-slate-50">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-6">
						<Link to="/dashboard" className="text-lg font-bold text-slate-900">
							IncidentDesk
						</Link>
						<nav className="flex items-center gap-4 text-sm text-slate-600">
							<Link to="/dashboard" className="hover:text-slate-900">
								Dashboard
							</Link>
							<Link to="/incidents" className="hover:text-slate-900">
								Incidents
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm text-slate-500">
							{user?.fullName} · <span className="font-medium text-slate-700">{user?.role}</span>
						</span>
						<button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
							Log out
						</button>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}
