import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

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
	'w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white py-2 pr-9 pl-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700';

/** Styled, accessible select. Renders a visible label when provided, otherwise uses aria-label. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, placeholder, options, id, className = '', ...props }, ref) => {
	const selectId = id ?? props.name;
	const control = (
		<div className="relative">
			<select ref={ref} id={selectId} aria-label={!label ? (props['aria-label'] ?? placeholder) : undefined} className={`${fieldClasses} ${className}`} {...props}>
				{placeholder !== undefined && <option value="">{placeholder}</option>}
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
		</div>
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
