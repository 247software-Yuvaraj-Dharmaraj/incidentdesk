import { useTranslation } from 'react-i18next';
import { Loader2, Siren } from 'lucide-react';

/** Full-screen branded loader for the initial app load / auth bootstrap / route chunk fetch. */
export function PageLoader() {
	const { t } = useTranslation();
	return (
		<div className="bg-canvas dark:bg-canvas-dark flex min-h-screen flex-col items-center justify-center gap-5" role="status" aria-live="polite" aria-busy="true">
			<div className="text-brand flex items-center gap-2">
				<Siren className="id-logo-pulse h-7 w-7" aria-hidden="true" />
				<span className="text-2xl font-bold tracking-tight">IncidentDesk</span>
			</div>
			<Loader2 className="text-brand h-6 w-6 animate-spin" aria-hidden="true" />
			<span className="sr-only">{t('common.loading')}</span>
		</div>
	);
}
