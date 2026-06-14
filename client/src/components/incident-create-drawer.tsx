import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateIncident } from '@/hooks/use-incidents';
import { useTriage, useTriageEnabled } from '@/hooks/use-triage';
import { getErrorMessage } from '@/api/http';
import { createIncidentSchema, type CreateIncidentValues } from '@/schemas/incident.schema';
import { TextField } from '@/components/ui/text-field';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { INCIDENT_TYPES, PRIORITIES } from '@/types/incident';

const FORM_ID = 'incident-create-form';
const toOptions = (values: string[]) => values.map((v) => ({ label: v.replace('_', ' '), value: v }));

export function IncidentCreateDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
	const { t } = useTranslation();
	const createIncident = useCreateIncident();
	const { data: aiEnabled } = useTriageEnabled();
	const triage = useTriage();
	const [formError, setFormError] = useState<string | null>(null);
	const [aiSummary, setAiSummary] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		setValue,
		watch,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<CreateIncidentValues>({
		resolver: zodResolver(createIncidentSchema),
		defaultValues: { type: 'INCIDENT', priority: 'MEDIUM' },
	});

	const title = watch('title');
	const description = watch('description') ?? '';

	async function onSubmit(values: CreateIncidentValues) {
		setFormError(null);
		try {
			const incident = await createIncident.mutateAsync(values);
			onCreated(incident.id);
		} catch (err) {
			setFormError(getErrorMessage(err, t('form.createFailed')));
		}
	}

	async function handleSuggest() {
		const { title, description } = getValues();
		try {
			const result = await triage.mutateAsync({ title, description });
			setValue('type', result.type, { shouldValidate: true });
			setValue('priority', result.priority, { shouldValidate: true });
			setAiSummary(result.summary);
			toast.success(t('toast.aiApplied'));
		} catch {
			toast.error(t('toast.aiFailed'));
		}
	}

	return (
		<Drawer
			open
			title={t('incidents.new')}
			onClose={onClose}
			size="md"
			footer={
				<>
					<Button variant="secondary" size="sm" onClick={onClose}>
						{t('common.cancel')}
					</Button>
					<Button type="submit" form={FORM_ID} size="sm" loading={isSubmitting}>
						{isSubmitting ? t('form.creating') : t('form.create')}
					</Button>
				</>
			}
		>
			<form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
				{formError && (
					<div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
						{formError}
					</div>
				)}

				<TextField label={t('form.title')} placeholder={t('form.titlePlaceholder')} maxLength={140} {...register('title')} error={errors.title?.message} />

				{aiEnabled && (
					<div className="flex flex-col gap-2">
						<Button type="button" variant="secondary" size="sm" onClick={handleSuggest} disabled={triage.isPending || !title || title.trim().length < 3} className="self-start">
							<Sparkles className="h-4 w-4" />
							{triage.isPending ? t('form.suggesting') : t('form.suggestWithAi')}
						</Button>
						{aiSummary && (
							<p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
								<span className="font-medium text-slate-500 dark:text-slate-400">{t('form.aiSummary')}: </span>
								{aiSummary}
							</p>
						)}
					</div>
				)}

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Controller name="type" control={control} render={({ field }) => <Select label={t('form.type')} options={toOptions(INCIDENT_TYPES)} value={field.value} onChange={field.onChange} />} />
					<Controller name="priority" control={control} render={({ field }) => <Select label={t('form.priority')} options={toOptions(PRIORITIES)} value={field.value} onChange={field.onChange} />} />
				</div>

				<Controller
					name="dueDate"
					control={control}
					render={({ field }) => (
						<div className="flex flex-col gap-1">
							<label htmlFor="dueDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
								{t('form.dueDate')}
							</label>
							<input
								id="dueDate"
								type="date"
								value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
								onChange={(e) => field.onChange(e.target.value ? new Date(`${e.target.value}T00:00:00Z`).toISOString() : undefined)}
								className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
							/>
						</div>
					)}
				/>

				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between">
						<label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
							{t('form.description')}
						</label>
						<span className="text-xs text-slate-400 dark:text-slate-500">{description.length}/2000</span>
					</div>
					<textarea
						id="description"
						rows={4}
						maxLength={2000}
						placeholder={t('form.descriptionPlaceholder')}
						className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
						{...register('description')}
					/>
					{errors.description && <span className="text-xs text-red-500 dark:text-red-400">{errors.description.message}</span>}
				</div>
			</form>
		</Drawer>
	);
}
