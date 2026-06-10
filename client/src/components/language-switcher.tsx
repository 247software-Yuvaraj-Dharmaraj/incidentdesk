import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { Select } from '@/components/ui/select';

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const current = i18n.resolvedLanguage ?? 'en';

	return <Select aria-label="Language" value={current} onChange={(v) => i18n.changeLanguage(v)} options={SUPPORTED_LANGUAGES.map((lang) => ({ label: lang.label, value: lang.code }))} className="min-w-28" />;
}
