import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/require-role.js';
import { listUsersHandler } from '../controllers/user.controller.js';

const router = Router();

router.get('/', requireAuth, requireRole(Role.ADMIN), listUsersHandler);

export default router;
