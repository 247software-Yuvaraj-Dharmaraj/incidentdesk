import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
	key: string;
	label: string;
	icon?: ReactNode;
	onSelect: () => void;
	destructive?: boolean;
}

/** Compact kebab (⋮) row-actions menu. Renders the popover in a portal so it is never clipped by a scrollable table container. */
export function ActionMenu({ items, label }: { items: ActionMenuItem[]; label: string }) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
	const triggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!open || !triggerRef.current) return;
		const r = triggerRef.current.getBoundingClientRect();
		const estimatedHeight = items.length * 38 + 8;
		const openUp = r.bottom + estimatedHeight > window.innerHeight;
		setPos({ top: openUp ? r.top - estimatedHeight - 4 : r.bottom + 4, right: window.innerWidth - r.right });
	}, [open, items.length]);

	useEffect(() => {
		if (!open) return;
		const close = () => setOpen(false);
		function onPointer(e: MouseEvent) {
			if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setOpen(false);
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				setOpen(false);
				triggerRef.current?.focus();
			}
		}
		document.addEventListener('mousedown', onPointer);
		document.addEventListener('keydown', onKey);
		window.addEventListener('scroll', close, true);
		window.addEventListener('resize', close);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('keydown', onKey);
			window.removeEventListener('scroll', close, true);
			window.removeEventListener('resize', close);
		};
	}, [open]);

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-label={label}
				aria-haspopup="menu"
				aria-expanded={open}
				className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
			>
				<MoreVertical className="h-4 w-4" />
			</button>
			{open &&
				createPortal(
					<div
						ref={menuRef}
						role="menu"
						style={{ top: pos.top, right: pos.right }}
						className="fixed z-50 min-w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
					>
						{items.map((item) => (
							<button
								key={item.key}
								type="button"
								role="menuitem"
								onClick={() => {
									setOpen(false);
									item.onSelect();
								}}
								className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
									item.destructive
										? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950'
										: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
								}`}
							>
								{item.icon}
								{item.label}
							</button>
						))}
					</div>,
					document.body
				)}
		</>
	);
}
