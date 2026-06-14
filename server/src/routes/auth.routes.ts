import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { loginSchema, preferencesSchema, signupSchema } from '../schemas/auth.schema.js';
import { login, logout, me, signup, updatePreferences } from '../controllers/auth.controller.js';

// Throttle credential endpoints to slow brute-force attempts.
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many attempts, please try again later' },
});

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.patch('/me/preferences', requireAuth, validate(preferencesSchema), updatePreferences);

export default router;
