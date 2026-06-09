import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
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
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
