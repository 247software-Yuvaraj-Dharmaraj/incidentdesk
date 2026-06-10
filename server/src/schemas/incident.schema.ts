import { z } from 'zod';
import { IncidentType, Priority, Status } from '@prisma/client';

const titleField = z.string().trim().min(3, 'Title must be at least 3 characters').max(140);
const descriptionField = z.string().trim().max(2000).optional();

export const createIncidentSchema = z.object({
	title: titleField,
	type: z.nativeEnum(IncidentType).default(IncidentType.INCIDENT),
	priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
	description: descriptionField,
});

export const updateIncidentSchema = z
	.object({
		status: z.nativeEnum(Status).optional(),
		priority: z.nativeEnum(Priority).optional(),
		assigneeId: z.string().cuid().nullable().optional(),
		dueDate: z.string().datetime().nullable().optional(),
		// Optimistic concurrency: the updatedAt the client last saw. Stale value is rejected (409).
		expectedUpdatedAt: z.string().datetime().optional(),
	})
	.refine((data) => Object.keys(data).some((k) => k !== 'expectedUpdatedAt'), { message: 'At least one field is required' });

export const addCommentSchema = z.object({
	body: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
	internal: z.boolean().optional().default(false),
});

export const bulkUpdateSchema = z
	.object({
		ids: z.array(z.string().cuid()).min(1).max(100),
		status: z.nativeEnum(Status).optional(),
		priority: z.nativeEnum(Priority).optional(),
		assigneeId: z.string().cuid().nullable().optional(),
	})
	.refine((d) => d.status !== undefined || d.priority !== undefined || d.assigneeId !== undefined, { message: 'At least one field is required' });

export const bulkDeleteSchema = z.object({
	ids: z.array(z.string().cuid()).min(1).max(100),
});

export const listIncidentsQuerySchema = z.object({
	status: z.nativeEnum(Status).optional(),
	type: z.nativeEnum(IncidentType).optional(),
	priority: z.nativeEnum(Priority).optional(),
	q: z.string().trim().min(1).optional(),
	// A user id (cuid), or the literal "unassigned" to match incidents with no assignee.
	assigneeId: z.union([z.string().cuid(), z.literal('unassigned')]).optional(),
	overdue: z
		.enum(['true', 'false'])
		.transform((v) => v === 'true')
		.optional(),
	cursor: z.string().cuid().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const triageSchema = z.object({
	title: titleField,
	description: descriptionField,
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type TriageInput = z.infer<typeof triageSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type ListIncidentsQuery = z.infer<typeof listIncidentsQuerySchema>;
