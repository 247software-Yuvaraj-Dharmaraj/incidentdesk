import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

interface Option {
	label: string;
	value: string;
}

interface SelectProps {
	value: string;
	onChange: (value: string) => void;
	options: Option[];
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
	name?: string;
	className?: string;
	'aria-label'?: string;
}

const triggerClasses =
	'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:border-slate-500 dark:focus-visible:ring-slate-700';

/** Accessible custom select (listbox). Replaces the native control so options get hover/pointer styling. Renders the list in a portal so it is never clipped. */
export function Select({ value, onChange, options, label, placeholder, disabled, id, name, className = '', 'aria-label': ariaLabel }: SelectProps) {
	const reactId = useId();
	const selectId = id ?? name ?? reactId;
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
	const triggerRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	const allOptions = placeholder !== undefined ? [{ label: placeholder, value: '' }, ...options] : options;
	const selected = allOptions.find((o) => o.value === value);
	const showPlaceholderStyle = placeholder !== undefined && value === '';

	useLayoutEffect(() => {
		if (!open || !triggerRef.current) return;
		const r = triggerRef.current.getBoundingClientRect();
		const listHeight = Math.min(allOptions.length * 38 + 8, 264);
		const openUp = r.bottom + listHeight > window.innerHeight && r.top > listHeight;
		setPos({ top: openUp ? r.top - listHeight - 4 : r.bottom + 4, left: r.left, width: r.width });
	}, [open, allOptions.length]);

	useEffect(() => {
		if (!open) return;
		const close = () => setOpen(false);
		function onPointer(e: MouseEvent) {
			if (!listRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener('mousedown', onPointer);
		window.addEventListener('scroll', close, true);
		window.addEventListener('resize', close);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			window.removeEventListener('scroll', close, true);
			window.removeEventListener('resize', close);
		};
	}, [open]);

	useEffect(() => {
		if (open && listRef.current) (listRef.current.children[activeIndex] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
	}, [open, activeIndex]);

	function openMenu() {
		if (disabled) return;
		const idx = allOptions.findIndex((o) => o.value === value);
		setActiveIndex(idx < 0 ? 0 : idx);
		setOpen(true);
	}

	function selectIndex(i: number) {
		const opt = allOptions[i];
		if (opt) onChange(opt.value);
		setOpen(false);
		triggerRef.current?.focus();
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!open) {
			if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				openMenu();
			}
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActiveIndex((i) => Math.min(i + 1, allOptions.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			selectIndex(activeIndex);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			setOpen(false);
			triggerRef.current?.focus();
		} else if (e.key === 'Home') {
			e.preventDefault();
			setActiveIndex(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			setActiveIndex(allOptions.length - 1);
		}
	}

	const trigger = (
		<button
			ref={triggerRef}
			type="button"
			id={selectId}
			role="combobox"
			aria-haspopup="listbox"
			aria-expanded={open}
			aria-label={!label ? (ariaLabel ?? placeholder) : undefined}
			disabled={disabled}
			onClick={() => (open ? setOpen(false) : openMenu())}
			onKeyDown={onKeyDown}
			className={`${triggerClasses} ${className}`}
		>
			<span className={showPlaceholderStyle ? 'text-slate-400 dark:text-slate-500' : ''}>{selected ? selected.label : (placeholder ?? '')}</span>
			<ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
		</button>
	);

	const menu =
		open &&
		createPortal(
			<ul ref={listRef} role="listbox" style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }} className="thin-scrollbar z-50 max-h-[264px] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
				{allOptions.map((opt, i) => {
					const isSelected = opt.value === value;
					return (
						<li
							key={opt.value || '__placeholder'}
							role="option"
							aria-selected={isSelected}
							onMouseEnter={() => setActiveIndex(i)}
							onClick={() => selectIndex(i)}
							className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition ${i === activeIndex ? 'bg-slate-100 dark:bg-slate-700' : ''} ${isSelected ? 'text-brand font-medium' : 'text-slate-700 dark:text-slate-200'}`}
						>
							{opt.label}
							{isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
						</li>
					);
				})}
			</ul>,
			document.body
		);

	if (!label)
		return (
			<div className="relative">
				{trigger}
				{menu}
			</div>
		);

	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
				{label}
			</label>
			{trigger}
			{menu}
		</div>
	);
}
