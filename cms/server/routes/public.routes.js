// server/routes/public.routes.js
import { Router } from 'express';
import {
  getSitePublic,
  listPublicPages,
  getPublicPageByPath,
  listPublicPosts,
  getPublicPostBySlug,
} from '../controllers/public.controller.js';

const router = Router();

// Osnovni sajt i homepage
router.get('/:siteSlug', getSitePublic);

// Stranice
router.get('/:siteSlug/pages', listPublicPages);
router.get('/:siteSlug/page', getPublicPageByPath);

// Postovi (lista + detalj)
router.get('/:siteSlug/posts', listPublicPosts);
router.get('/:siteSlug/post/:slug', getPublicPostBySlug);

export default router;
