import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/api/http';
import { signupSchema, type SignupValues } from '@/schemas/auth.schema';
import { TextField } from '@/components/ui/text-field';

export function SignupPage() {
	const { signup } = useAuth();
	const navigate = useNavigate();
	const [formError, setFormError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

	async function onSubmit(values: SignupValues) {
		setFormError(null);
		try {
			await signup(values);
			navigate('/dashboard');
		} catch (err) {
			setFormError(getErrorMessage(err, 'Sign up failed'));
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
			<div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<h1 className="mb-1 text-2xl font-bold text-slate-900">Create account</h1>
				<p className="mb-6 text-sm text-slate-500">Get started with IncidentDesk</p>

				{formError && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
					<TextField label="Full name" autoComplete="name" {...register('fullName')} error={errors.fullName?.message} />
					<TextField label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
					<TextField label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
					<button
						type="submit"
						disabled={isSubmitting}
						className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
					>
						{isSubmitting ? 'Creating account…' : 'Sign up'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-500">
					Already have an account?{' '}
					<Link to="/login" className="font-medium text-slate-900 hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
