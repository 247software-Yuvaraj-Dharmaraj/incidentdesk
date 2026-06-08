import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ label, error, id, ...props }, ref) => {
	const inputId = id ?? props.name;
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={inputId} className="text-sm font-medium text-slate-700">
				{label}
			</label>
			<input
				ref={ref}
				id={inputId}
				className={`rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
					error ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-slate-400 focus:ring-slate-200'
				}`}
				{...props}
			/>
			{error && <span className="text-xs text-red-500">{error}</span>}
		</div>
	);
});

TextField.displayName = 'TextField';
