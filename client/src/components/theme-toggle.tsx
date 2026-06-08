import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/theme-context';

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const { t } = useTranslation();
	const isDark = theme === 'dark';

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={t(isDark ? 'common.switchToLight' : 'common.switchToDark')}
			title={t(isDark ? 'common.switchToLight' : 'common.switchToDark')}
			className="rounded-lg border border-slate-300 p-1.5 text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
		>
			{isDark ? <SunIcon /> : <MoonIcon />}
		</button>
	);
}

function SunIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}
