import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Role } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/require-role.js';
import { validate } from '../middleware/validate.js';
import { addCommentSchema, bulkDeleteSchema, bulkUpdateSchema, createIncidentSchema, listIncidentsQuerySchema, triageSchema, updateIncidentSchema } from '../schemas/incident.schema.js';
import { addCommentHandler, bulkDeleteHandler, bulkUpdateHandler, createIncidentHandler, deleteIncidentHandler, getIncidentHandler, listCommentsHandler, listIncidentsHandler, metricsHandler, statsHandler, triageEnabledHandler, triageHandler, updateIncidentHandler } from '../controllers/incident.controller.js';

// Throttle AI triage to protect the (quota-limited) Gemini key from abuse.
const triageLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 15,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many AI requests — please slow down' },
});

// Soft cap on writes (incident + comment creation) to curb spam.
const writeLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 30,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many requests — please slow down' },
});

const router = Router();

router.use(requireAuth);

router.get('/', validate(listIncidentsQuerySchema, 'query'), listIncidentsHandler);
router.get('/stats', statsHandler);
router.get('/metrics', metricsHandler);
router.get('/triage/status', triageEnabledHandler);
router.post('/triage', triageLimiter, validate(triageSchema), triageHandler);
router.post('/', writeLimiter, validate(createIncidentSchema), createIncidentHandler);
router.post('/bulk-update', requireRole(Role.ADMIN), writeLimiter, validate(bulkUpdateSchema), bulkUpdateHandler);
router.post('/bulk-delete', requireRole(Role.ADMIN), writeLimiter, validate(bulkDeleteSchema), bulkDeleteHandler);
router.get('/:id', getIncidentHandler);
router.patch('/:id', requireRole(Role.ADMIN), validate(updateIncidentSchema), updateIncidentHandler);
router.delete('/:id', requireRole(Role.ADMIN), deleteIncidentHandler);

router.get('/:id/comments', listCommentsHandler);
router.post('/:id/comments', writeLimiter, validate(addCommentSchema), addCommentHandler);

export default router;
