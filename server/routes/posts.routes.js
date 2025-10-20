import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/posts.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/site/:siteId', ctrl.createPost);
router.get('/site/:siteId', ctrl.listPostsBySite);
router.get('/:postId', ctrl.getPost);
router.put('/:postId', ctrl.updatePost);
router.post('/:postId/publish', ctrl.publishPost);
router.delete('/:postId', ctrl.deletePost);

export default router;
