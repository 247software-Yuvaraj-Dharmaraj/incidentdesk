import { type RequestHandler } from 'express';
import { type ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

/**
 * Validates and coerces a request segment against a Zod schema.
 * On success, the parsed data replaces the original segment so
 * downstream handlers receive coerced, trusted values.
 */
export function validate(schema: ZodSchema, source: Source = 'body'): RequestHandler {
	return (req, _res, next) => {
		const result = schema.safeParse(req[source]);
		if (!result.success) {
			next(result.error);
			return;
		}
		req[source] = result.data;
		next();
	};
}
