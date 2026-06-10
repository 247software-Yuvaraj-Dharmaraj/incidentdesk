import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const current = i18n.resolvedLanguage ?? 'en';

	return (
		<select
			value={current}
			onChange={(e) => i18n.changeLanguage(e.target.value)}
			aria-label="Language"
			className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus:border-slate-500 dark:focus:ring-slate-700"
		>
			{SUPPORTED_LANGUAGES.map((lang) => (
				<option key={lang.code} value={lang.code}>
					{lang.label}
				</option>
			))}
		</select>
	);
}
