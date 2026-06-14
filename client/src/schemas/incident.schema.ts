import { z } from 'zod';

export const createIncidentSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(140),
	type: z.enum(['INCIDENT', 'REQUEST', 'MAINTENANCE']),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
	description: z.string().max(2000).optional(),
	dueDate: z.string().datetime().optional(),
});

export type CreateIncidentValues = z.infer<typeof createIncidentSchema>;
