import { asyncHandler } from '../lib/async-handler.js';
import { createIncidentForUser, getIncidentForUser, listIncidentsForUser } from '../services/incident.service.js';
import { type CreateIncidentInput, type ListIncidentsQuery } from '../schemas/incident.schema.js';

export const listIncidentsHandler = asyncHandler(async (req, res) => {
	const result = await listIncidentsForUser(req.query as unknown as ListIncidentsQuery, req.user!);
	res.json(result);
});

export const createIncidentHandler = asyncHandler(async (req, res) => {
	const incident = await createIncidentForUser(req.body as CreateIncidentInput, req.user!);
	res.status(201).json({ incident });
});

export const getIncidentHandler = asyncHandler(async (req, res) => {
	const incident = await getIncidentForUser(req.params.id, req.user!);
	res.json({ incident });
});
