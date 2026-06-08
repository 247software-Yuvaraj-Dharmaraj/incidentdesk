import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
	JWT_EXPIRES_IN: z.string().default('7d'),
	CLIENT_URL: z.string().url().default('http://localhost:5173'),
	PORT: z.coerce.number().default(4000),
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
	throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
