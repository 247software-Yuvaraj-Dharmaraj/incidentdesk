import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/use-focus-trap';

type Size = 'md' | 'lg' | 'xl';

const widths: Record<Size, string> = {
	md: 'max-w-md',
	lg: 'max-w-xl',
	xl: 'max-w-3xl',
};

interface DrawerProps {
	open: boolean;
	title: ReactNode;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
	size?: Size;
}

/** Right-side slide-over panel (keeps the list behind it). Focus-trapped, Escape to close. */
export function Drawer({ open, title, onClose, children, footer, size = 'md' }: DrawerProps) {
	const titleId = useId();
	const trapRef = useFocusTrap<HTMLElement>(open);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		document.addEventListener('keydown', onKey);
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = '';
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
			<aside
				ref={trapRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(e) => e.stopPropagation()}
				className={`flex h-full w-full ${widths[size]} flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900`}
			>
				<header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
					<div id={titleId} className="min-w-0 text-base font-semibold text-slate-800 dark:text-slate-100">
						{title}
					</div>
					<button
						onClick={onClose}
						aria-label="Close"
						className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:hover:bg-slate-800 dark:hover:text-slate-200"
					>
						<X className="h-[18px] w-[18px]" />
					</button>
				</header>
				<div className="flex-1 overflow-y-auto p-5">{children}</div>
				{footer && <footer className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">{footer}</footer>}
			</aside>
		</div>
	);
}
