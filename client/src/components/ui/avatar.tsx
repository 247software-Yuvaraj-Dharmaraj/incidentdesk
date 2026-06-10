function initials(name: string): string {
	const parts = name.trim().split(/\s+/);
	return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '')).toUpperCase() || '?';
}

// Deterministic, theme-friendly tint per name so avatars are distinguishable.
const TINTS = ['bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300', 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'];

function tintFor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
	return TINTS[hash % TINTS.length];
}

/** Initials avatar with a deterministic color, paired with an optional label. */
export function Avatar({ name, label }: { name: string; label?: string }) {
	return (
		<span className="inline-flex items-center gap-2">
			<span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${tintFor(name)}`} title={name} aria-hidden="true">
				{initials(name)}
			</span>
			{label !== undefined ? <span>{label}</span> : <span>{name}</span>}
		</span>
	);
}
