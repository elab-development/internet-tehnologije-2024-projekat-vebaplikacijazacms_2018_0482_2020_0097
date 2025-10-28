import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listUsers } from '../controllers/users.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listUsers);

export default router;
