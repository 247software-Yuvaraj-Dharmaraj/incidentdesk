import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/hooks/use-realtime';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { DensityToggle } from '@/components/density-toggle';
import { Button } from '@/components/ui/button';

export function AppLayout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { connected } = useRealtime();

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
						{connected && (
							<span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400" title={t('common.live')}>
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
								</span>
								{t('common.live')}
							</span>
						)}
						<span className="text-sm text-slate-500 dark:text-slate-400">
							{user?.fullName} · <span className="font-medium text-slate-700 dark:text-slate-300">{user?.role}</span>
						</span>
						<DensityToggle />
						<ThemeToggle />
						<LanguageSwitcher />
						<Button variant="secondary" size="sm" onClick={handleLogout}>
							<LogOut className="h-4 w-4" />
							{t('common.logout')}
						</Button>
					</div>
				</div>
			</header>
			<main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}
