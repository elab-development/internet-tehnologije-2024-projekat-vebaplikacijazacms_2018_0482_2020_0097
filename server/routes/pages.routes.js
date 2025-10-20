import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/pages.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/site/:siteId', ctrl.createPage);
router.get('/:pageId', ctrl.getPage);
router.put('/:pageId', ctrl.updatePage);
router.delete('/:pageId', ctrl.deletePage);
router.post('/:pageId/duplicate', ctrl.duplicatePage);
router.post('/site/:siteId/homepage', ctrl.setHomepage);

export default router;
