import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buttonClasses } from '@/components/ui/button';

export function NotFoundPage() {
	const { t } = useTranslation();
	return (
		<div className="bg-canvas dark:bg-canvas-dark flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
			<p className="text-brand text-5xl font-bold tracking-tight tabular-nums">404</p>
			<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('notFound.title')}</h1>
			<p className="text-sm text-slate-500 dark:text-slate-400">{t('notFound.body')}</p>
			<Link to="/dashboard" className={`${buttonClasses('primary')} mt-2`}>
				{t('notFound.back')}
			</Link>
		</div>
	);
}
