import { forwardRef, type SelectHTMLAttributes } from 'react';

interface Option {
	label: string;
	value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	placeholder?: string;
	options: Option[];
}

const fieldClasses =
	'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700';

/** Styled, accessible select. Renders a visible label when provided, otherwise uses aria-label. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, placeholder, options, id, className = '', ...props }, ref) => {
	const selectId = id ?? props.name;
	const control = (
		<select ref={ref} id={selectId} aria-label={!label ? (props['aria-label'] ?? placeholder) : undefined} className={`${fieldClasses} ${className}`} {...props}>
			{placeholder !== undefined && <option value="">{placeholder}</option>}
			{options.map((opt) => (
				<option key={opt.value} value={opt.value}>
					{opt.label}
				</option>
			))}
		</select>
	);

	if (!label) return control;

	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
				{label}
			</label>
			{control}
		</div>
	);
});

Select.displayName = 'Select';
