import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/api/http';
import { loginSchema, type LoginValues } from '@/schemas/auth.schema';
import { TextField } from '@/components/ui/text-field';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [formError, setFormError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

	function fillDemo(email: string, password: string) {
		setValue('email', email, { shouldValidate: true });
		setValue('password', password, { shouldValidate: true });
	}

	async function onSubmit(values: LoginValues) {
		setFormError(null);
		try {
			await login(values);
			navigate('/dashboard');
		} catch (err) {
			setFormError(getErrorMessage(err, t('auth.loginFailed')));
		}
	}

	return (
		<div className="auth-bg flex min-h-screen items-center justify-center px-4">
			<Card className="w-full max-w-sm p-8 shadow-sm">
				<Logo className="mb-6" />
				<h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('auth.welcomeBack')}</h1>
				<p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{t('auth.signInSubtitle')}</p>

				{formError && (
					<div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
						{formError}
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
					<TextField label={t('auth.email')} type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
					<TextField label={t('auth.password')} type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
					<Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
						{isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
					{t('auth.noAccount')}{' '}
					<Link to="/signup" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
						{t('auth.signUp')}
					</Link>
				</p>

				<div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
					<p className="text-center text-xs text-slate-400 dark:text-slate-500">{t('auth.demoHint')}</p>
					<div className="mt-2 flex items-center justify-center gap-2">
						<button
							type="button"
							onClick={() => fillDemo('admin@incidentdesk.dev', 'Admin123!')}
							title="admin@incidentdesk.dev / Admin123!"
							className="hover:border-brand/40 hover:text-brand rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition dark:border-slate-700 dark:text-slate-300"
						>
							{t('auth.demoAdmin')}
						</button>
						<button
							type="button"
							onClick={() => fillDemo('reporter@incidentdesk.dev', 'Reporter123!')}
							title="reporter@incidentdesk.dev / Reporter123!"
							className="hover:border-brand/40 hover:text-brand rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition dark:border-slate-700 dark:text-slate-300"
						>
							{t('auth.demoReporter')}
						</button>
					</div>
				</div>
			</Card>
		</div>
	);
}
