import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/hooks/use-realtime';
import { usePreferenceSync } from '@/hooks/use-preference-sync';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { DensityToggle } from '@/components/density-toggle';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export function AppLayout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { connected } = useRealtime();
	usePreferenceSync(); // theme/density follow the logged-in account
	const [menuOpen, setMenuOpen] = useState(false);

	async function handleLogout() {
		setMenuOpen(false);
		await logout();
		navigate('/login');
	}

	const navItems = [
		{ to: '/dashboard', label: t('nav.dashboard') },
		{ to: '/incidents', label: t('nav.incidents') },
	];

	const liveIndicator = connected ? (
		<span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400" title={t('common.live')}>
			<span className="relative flex h-2 w-2">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
				<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
			</span>
			{t('common.live')}
		</span>
	) : null;

	return (
		<div className="bg-canvas dark:bg-canvas-dark min-h-screen">
			<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white">
				{t('common.skipToContent')}
			</a>
			<header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
					<div className="flex min-w-0 items-center gap-6">
						<Link to="/dashboard" className="shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none" onClick={() => setMenuOpen(false)} aria-label="IncidentDesk">
							<Logo />
						</Link>
						<nav aria-label={t('nav.primary')} className="hidden items-center gap-1 text-sm lg:flex">
							{navItems.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									className={({ isActive }) =>
										`rounded-md px-2 py-1 transition ${isActive ? 'bg-brand/10 text-brand font-medium' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`
									}
								>
									{item.label}
								</NavLink>
							))}
						</nav>
					</div>

					{/* Desktop controls */}
					<div className="hidden items-center gap-4 lg:flex">
						{liveIndicator}
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

					{/* Mobile menu toggle */}
					<div className="flex items-center gap-3 lg:hidden">
						{liveIndicator}
						<button
							type="button"
							onClick={() => setMenuOpen((v) => !v)}
							aria-expanded={menuOpen}
							aria-controls="mobile-menu"
							aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
							className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-slate-800"
						>
							{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</button>
					</div>
				</div>

				{/* Mobile menu panel */}
				{menuOpen && (
					<div id="mobile-menu" className="border-t border-slate-200 px-4 py-4 lg:hidden dark:border-slate-800">
						<nav aria-label={t('nav.primary')} className="flex flex-col gap-1 text-sm">
							{navItems.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									onClick={() => setMenuOpen(false)}
									className={({ isActive }) =>
										`rounded-md px-3 py-2 transition ${isActive ? 'bg-brand/10 text-brand font-medium' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`
									}
								>
									{item.label}
								</NavLink>
							))}
						</nav>
						<div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
							<p className="px-3 text-sm text-slate-500 dark:text-slate-400">
								{user?.fullName} · <span className="font-medium text-slate-700 dark:text-slate-300">{user?.role}</span>
							</p>
							<div className="mt-3 flex items-center gap-3 px-3">
								<DensityToggle />
								<ThemeToggle />
								<LanguageSwitcher />
							</div>
							<div className="mt-3 px-3">
								<Button variant="secondary" size="sm" onClick={handleLogout} className="w-full">
									<LogOut className="h-4 w-4" />
									{t('common.logout')}
								</Button>
							</div>
						</div>
					</div>
				)}
			</header>
			<main id="main-content" className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
				<Outlet />
			</main>
		</div>
	);
}
