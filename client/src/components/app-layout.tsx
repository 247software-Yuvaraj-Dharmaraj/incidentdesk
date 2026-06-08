import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/auth-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { DensityToggle } from '@/components/density-toggle';

export function AppLayout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();

	async function handleLogout() {
		await logout();
		navigate('/login');
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white">
				{t('common.skipToContent')}
			</a>
			<header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-6">
						<Link to="/dashboard" className="text-lg font-bold text-slate-900 dark:text-slate-100">
							IncidentDesk
						</Link>
						<nav aria-label={t('nav.primary')} className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
							<Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-slate-100">
								{t('nav.dashboard')}
							</Link>
							<Link to="/incidents" className="hover:text-slate-900 dark:hover:text-slate-100">
								{t('nav.incidents')}
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm text-slate-500 dark:text-slate-400">
							{user?.fullName} · <span className="font-medium text-slate-700 dark:text-slate-300">{user?.role}</span>
						</span>
						<DensityToggle />
						<ThemeToggle />
						<LanguageSwitcher />
						<button
							type="button"
							onClick={handleLogout}
							className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							{t('common.logout')}
						</button>
					</div>
				</div>
			</header>
			<main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}
