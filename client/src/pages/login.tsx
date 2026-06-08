import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/api/http';
import { loginSchema, type LoginValues } from '@/schemas/auth.schema';
import { TextField } from '@/components/ui/text-field';

export function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [formError, setFormError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

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
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
			<div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.welcomeBack')}</h1>
				<p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{t('auth.signInSubtitle')}</p>

				{formError && (
					<div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
						{formError}
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
					<TextField label={t('auth.email')} type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
					<TextField label={t('auth.password')} type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
					<button
						type="submit"
						disabled={isSubmitting}
						className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
					>
						{isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
					{t('auth.noAccount')}{' '}
					<Link to="/signup" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
						{t('auth.signUp')}
					</Link>
				</p>
			</div>
		</div>
	);
}
