import { asyncHandler } from '../lib/async-handler.js';
import { listUsers } from '../repos/user.repo.js';

export const listUsersHandler = asyncHandler(async (_req, res) => {
	const users = await listUsers();
	res.json({ users });
});
