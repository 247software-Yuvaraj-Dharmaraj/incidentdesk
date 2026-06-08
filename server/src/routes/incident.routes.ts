import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createIncidentSchema, listIncidentsQuerySchema } from '../schemas/incident.schema.js';
import { createIncidentHandler, getIncidentHandler, listIncidentsHandler } from '../controllers/incident.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listIncidentsQuerySchema, 'query'), listIncidentsHandler);
router.post('/', validate(createIncidentSchema), createIncidentHandler);
router.get('/:id', getIncidentHandler);

export default router;
