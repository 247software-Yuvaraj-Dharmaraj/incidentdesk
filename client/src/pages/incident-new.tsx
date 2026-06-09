import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateIncident } from '@/hooks/use-incidents';
import { getErrorMessage } from '@/api/http';
import { createIncidentSchema, type CreateIncidentValues } from '@/schemas/incident.schema';
import { TextField } from '@/components/ui/text-field';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/ui/form-section';
import { INCIDENT_TYPES, PRIORITIES } from '@/types/incident';

const toOptions = (values: string[]) => values.map((v) => ({ label: v.replace('_', ' '), value: v }));

export function IncidentNewPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const createIncident = useCreateIncident();
	const [formError, setFormError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateIncidentValues>({
		resolver: zodResolver(createIncidentSchema),
		defaultValues: { type: 'INCIDENT', priority: 'MEDIUM' },
	});

	async function onSubmit(values: CreateIncidentValues) {
		setFormError(null);
		try {
			await createIncident.mutateAsync(values);
			navigate('/incidents');
		} catch (err) {
			setFormError(getErrorMessage(err, t('form.createFailed')));
		}
	}

	return (
		<FormSection
			title={t('incidents.new')}
			backTo={{ href: '/incidents', label: t('incidents.backToList') }}
			error={formError}
			onSubmit={handleSubmit(onSubmit)}
			footer={
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? t('form.creating') : t('form.create')}
				</Button>
			}
		>
			<TextField label={t('form.title')} placeholder={t('form.titlePlaceholder')} {...register('title')} error={errors.title?.message} />

			<div className="grid grid-cols-2 gap-4">
				<Select label={t('form.type')} options={toOptions(INCIDENT_TYPES)} {...register('type')} />
				<Select label={t('form.priority')} options={toOptions(PRIORITIES)} {...register('priority')} />
			</div>

			<div className="flex flex-col gap-1">
				<label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
					{t('form.description')}
				</label>
				<textarea
					id="description"
					rows={4}
					placeholder={t('form.descriptionPlaceholder')}
					className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
					{...register('description')}
				/>
				{errors.description && <span className="text-xs text-red-500 dark:text-red-400">{errors.description.message}</span>}
			</div>
		</FormSection>
	);
}
