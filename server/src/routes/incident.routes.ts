import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/require-role.js';
import { validate } from '../middleware/validate.js';
import { createIncidentSchema, listIncidentsQuerySchema, updateIncidentSchema } from '../schemas/incident.schema.js';
import { createIncidentHandler, getIncidentHandler, listIncidentsHandler, updateIncidentHandler } from '../controllers/incident.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listIncidentsQuerySchema, 'query'), listIncidentsHandler);
router.post('/', validate(createIncidentSchema), createIncidentHandler);
router.get('/:id', getIncidentHandler);
router.patch('/:id', requireRole(Role.ADMIN), validate(updateIncidentSchema), updateIncidentHandler);

export default router;
