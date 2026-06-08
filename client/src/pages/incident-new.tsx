import { forwardRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateIncident } from '@/hooks/use-incidents';
import { getErrorMessage } from '@/api/http';
import { createIncidentSchema, type CreateIncidentValues } from '@/schemas/incident.schema';
import { TextField } from '@/components/ui/text-field';
import { INCIDENT_TYPES, PRIORITIES } from '@/types/incident';

export function IncidentNewPage() {
	const navigate = useNavigate();
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
			setFormError(getErrorMessage(err, 'Failed to create incident'));
		}
	}

	return (
		<div className="mx-auto max-w-xl">
			<Link to="/incidents" className="text-sm text-slate-500 hover:underline">
				← Back to incidents
			</Link>
			<h1 className="mt-2 mb-6 text-2xl font-bold text-slate-900">New incident</h1>

			{formError && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>}

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6" noValidate>
				<TextField label="Title" placeholder="Brief summary" {...register('title')} error={errors.title?.message} />

				<div className="grid grid-cols-2 gap-4">
					<SelectField label="Type" options={INCIDENT_TYPES} {...register('type')} />
					<SelectField label="Priority" options={PRIORITIES} {...register('priority')} />
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="description" className="text-sm font-medium text-slate-700">
						Description
					</label>
					<textarea
						id="description"
						rows={4}
						placeholder="Optional details…"
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
						{...register('description')}
					/>
					{errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
				</div>

				<button type="submit" disabled={isSubmitting} className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
					{isSubmitting ? 'Creating…' : 'Create incident'}
				</button>
			</form>
		</div>
	);
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label: string;
	options: string[];
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({ label, options, ...props }, ref) => (
	<div className="flex flex-col gap-1">
		<label className="text-sm font-medium text-slate-700">{label}</label>
		<select ref={ref} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" {...props}>
			{options.map((opt) => (
				<option key={opt} value={opt}>
					{opt.replace('_', ' ')}
				</option>
			))}
		</select>
	</div>
));
SelectField.displayName = 'SelectField';
