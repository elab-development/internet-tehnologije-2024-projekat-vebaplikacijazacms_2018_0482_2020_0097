import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listTemplates,
  getTemplateByName,
} from '../controllers/templates.controller.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));
router.get('/', listTemplates);
router.get('/:name', getTemplateByName);

export default router;
