import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
	primary: 'bg-brand text-brand-fg hover:bg-brand-hover focus-visible:ring-brand/50',
	secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
	danger: 'border border-red-300 text-red-600 hover:bg-red-50 focus-visible:ring-red-400 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950',
	ghost: 'text-slate-500 hover:text-slate-900 focus-visible:underline dark:text-slate-400 dark:hover:text-slate-100',
};

const sizes: Record<Size, string> = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
	loading?: boolean;
}

/** Shared class string so links can be styled as buttons too. */
// eslint-disable-next-line react-refresh/only-export-components
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = ''): string {
	return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', className, type = 'button', loading = false, disabled, children, ...props }, ref) => (
	<button ref={ref} type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
		{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
		{children}
	</button>
));

Button.displayName = 'Button';
