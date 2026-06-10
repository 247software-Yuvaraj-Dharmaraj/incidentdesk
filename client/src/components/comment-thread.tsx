import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { useAddComment, useComments } from '@/hooks/use-incidents';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/context/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Renders a comment body with @mentions of known users highlighted. */
function renderBody(body: string, names: string[]): ReactNode {
	if (names.length === 0) return body;
	const re = new RegExp(`@(${names.map(escapeRegex).join('|')})`, 'g');
	const out: ReactNode[] = [];
	let last = 0;
	let m: RegExpExecArray | null;
	let i = 0;
	while ((m = re.exec(body)) !== null) {
		if (m.index > last) out.push(body.slice(last, m.index));
		out.push(
			<span key={i++} className="text-brand font-medium">
				{m[0]}
			</span>
		);
		last = m.index + m[0].length;
	}
	if (last < body.length) out.push(body.slice(last));
	return out;
}

export function CommentThread({ incidentId }: { incidentId: string }) {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const isAdmin = user?.role === 'ADMIN';
	const { data: users } = useUsers(isAdmin);
	const { data: comments, isLoading } = useComments(incidentId);
	const addComment = useAddComment(incidentId);

	const [body, setBody] = useState('');
	const [internal, setInternal] = useState(false);
	const [mentionQuery, setMentionQuery] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const names = (users ?? []).map((u) => u.fullName);
	const candidates = mentionQuery !== null ? (users ?? []).filter((u) => u.fullName.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5) : [];

	function onChange(value: string, caret: number) {
		setBody(value);
		const token = value.slice(0, caret).match(/@([\p{L}\p{N} ]*)$/u);
		setMentionQuery(token ? token[1] : null);
	}

	function insertMention(name: string) {
		const el = textareaRef.current;
		const caret = el?.selectionStart ?? body.length;
		const token = body.slice(0, caret).match(/@([\p{L}\p{N} ]*)$/u);
		const start = token ? caret - token[0].length : caret;
		const next = `${body.slice(0, start)}@${name} ${body.slice(caret)}`;
		setBody(next);
		setMentionQuery(null);
		queueMicrotask(() => el?.focus());
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = body.trim();
		if (!trimmed) return;
		try {
			await addComment.mutateAsync({ body: trimmed, internal });
			setBody('');
			setInternal(false);
		} catch {
			/* error toast handled in the hook */
		}
	}

	return (
		<div>
			{isLoading ? (
				<div className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" role="status" aria-live="polite" />
			) : comments && comments.length > 0 ? (
				<ul className="space-y-3">
					{comments.map((c) => (
						<li key={c.id} className={`rounded-lg border px-4 py-3 ${c.internal ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
							<div className="flex items-center justify-between gap-2">
								<Avatar name={c.author.fullName} />
								<div className="flex items-center gap-2">
									{c.internal && (
										<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
											<Lock className="h-2.5 w-2.5" />
											{t('comments.internal')}
										</span>
									)}
									<span className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.createdAt).toLocaleString(i18n.resolvedLanguage)}</span>
								</div>
							</div>
							<p className="mt-1 text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-300">{renderBody(c.body, names)}</p>
						</li>
					))}
				</ul>
			) : (
				<p className="text-sm text-slate-400 dark:text-slate-500">{t('comments.empty')}</p>
			)}

			<form onSubmit={submit} className="mt-3 flex flex-col gap-2">
				<div className="relative">
					<textarea
						ref={textareaRef}
						rows={3}
						value={body}
						onChange={(e) => onChange(e.target.value, e.target.selectionStart)}
						maxLength={2000}
						placeholder={t('comments.placeholder')}
						aria-label={t('comments.placeholder')}
						className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
					/>
					{candidates.length > 0 && (
						<ul role="listbox" className="absolute right-0 bottom-full left-0 z-10 mb-1 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
							{candidates.map((u) => (
								<li key={u.id}>
									<button type="button" onClick={() => insertMention(u.fullName)} className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
										<Avatar name={u.fullName} />
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="flex items-center justify-between gap-3">
					{isAdmin ? (
						<label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
							<input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="text-brand accent-brand h-4 w-4 cursor-pointer rounded border-slate-300 dark:border-slate-600" />
							{t('comments.internalNote')}
						</label>
					) : (
						<span />
					)}
					<Button type="submit" size="sm" loading={addComment.isPending} disabled={!body.trim()}>
						{t('comments.post')}
					</Button>
				</div>
			</form>
		</div>
	);
}
