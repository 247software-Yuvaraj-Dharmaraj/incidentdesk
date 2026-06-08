import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ label, error, id, ...props }, ref) => {
	const inputId = id ?? props.name;
	const errorId = error ? `${inputId}-error` : undefined;
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
				{label}
			</label>
			<input
				ref={ref}
				id={inputId}
				aria-invalid={error ? true : undefined}
				aria-describedby={errorId}
				className={`rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
					error ? 'border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900' : 'border-slate-300 focus:border-slate-400 focus:ring-slate-200 dark:border-slate-700 dark:focus:border-slate-500 dark:focus:ring-slate-700'
				}`}
				{...props}
			/>
			{error && (
				<span id={errorId} className="text-xs text-red-500 dark:text-red-400">
					{error}
				</span>
			)}
		</div>
	);
});

TextField.displayName = 'TextField';
