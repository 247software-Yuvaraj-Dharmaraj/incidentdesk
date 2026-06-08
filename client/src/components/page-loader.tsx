import { useTranslation } from 'react-i18next';

export function PageLoader() {
	const { t } = useTranslation();
	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400" role="status" aria-live="polite">
			<span>{t('common.loading')}</span>
		</div>
	);
}
