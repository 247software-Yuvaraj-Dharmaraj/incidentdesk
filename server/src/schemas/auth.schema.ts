import { z } from 'zod';

export const signupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, 'Password is required'),
});

export const preferencesSchema = z
	.object({
		theme: z.enum(['light', 'dark']).optional(),
		density: z.enum(['comfortable', 'compact']).optional(),
	})
	.refine((d) => d.theme !== undefined || d.density !== undefined, {
		message: 'At least one preference is required',
	});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
