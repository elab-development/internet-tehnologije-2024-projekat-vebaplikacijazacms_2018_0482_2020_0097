import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as ctrl from '../controllers/sites.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('admin'), ctrl.createSite);
router.get('/', ctrl.listMySites);
router.get('/:id', ctrl.getSite);
router.put('/:id', ctrl.updateSite);
router.delete('/:id', ctrl.deleteSite);
router.post('/:id/publish', ctrl.publishSite);
router.post('/:id/editors', ctrl.modifyEditors);
router.get('/:id/pages', ctrl.listPagesOfSite);
router.post('/:id/autoblog', requireRole('admin'), ctrl.createBlogPage);

export default router;
