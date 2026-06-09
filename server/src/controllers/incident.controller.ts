import { asyncHandler } from '../lib/async-handler.js';
import { createIncidentForUser, deleteIncidentByAdmin, getIncidentForUser, getStatsForUser, listIncidentsForUser, updateIncidentByAdmin } from '../services/incident.service.js';
import { triageIncident } from '../services/triage.service.js';
import { isTriageEnabled } from '../lib/gemini.js';
import { type CreateIncidentInput, type ListIncidentsQuery, type TriageInput, type UpdateIncidentInput } from '../schemas/incident.schema.js';

export const listIncidentsHandler = asyncHandler(async (req, res) => {
	const result = await listIncidentsForUser(req.query as unknown as ListIncidentsQuery, req.user!);
	res.json(result);
});

export const statsHandler = asyncHandler(async (req, res) => {
	const stats = await getStatsForUser(req.user!);
	res.json(stats);
});

export const triageEnabledHandler = asyncHandler(async (_req, res) => {
	res.json({ enabled: isTriageEnabled() });
});

export const triageHandler = asyncHandler(async (req, res) => {
	const result = await triageIncident(req.body as TriageInput);
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

export const updateIncidentHandler = asyncHandler(async (req, res) => {
	const incident = await updateIncidentByAdmin(req.params.id, req.body as UpdateIncidentInput, req.user!);
	res.json({ incident });
});

export const deleteIncidentHandler = asyncHandler(async (req, res) => {
	await deleteIncidentByAdmin(req.params.id);
	res.status(204).end();
});
