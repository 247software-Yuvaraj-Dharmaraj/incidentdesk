import { z } from 'zod';
import { IncidentType, Priority, Status } from '@prisma/client';

export const createIncidentSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(140),
	type: z.nativeEnum(IncidentType).default(IncidentType.INCIDENT),
	priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
	description: z.string().max(2000).optional(),
});

export const listIncidentsQuerySchema = z.object({
	status: z.nativeEnum(Status).optional(),
	type: z.nativeEnum(IncidentType).optional(),
	priority: z.nativeEnum(Priority).optional(),
	q: z.string().trim().min(1).optional(),
	cursor: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type ListIncidentsQuery = z.infer<typeof listIncidentsQuerySchema>;
