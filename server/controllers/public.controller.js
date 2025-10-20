// server/controllers/public.controller.js
import { Site, Page, Post } from '../models/index.js'; // modeli Site/Page/Post
import { asyncHandler } from '../utils/asyncHandler.js'; // async wrapper

/**
 * Helper: vrati publishovan sajt po slug-u, ili 404/Not published.
 */
async function getPublishedSiteBySlug(siteSlug) {
  const site = await Site.findOne({ slug: siteSlug });
  if (!site || !site.isPublished) {
    const e = new Error('Site not found or not published');
    e.status = 404;
    throw e;
  }
  return site;
}

/**
 * GET /api/public/:siteSlug
 * Vraća meta informacije sajta i homepage stranicu (ako postoji).
 */
export const getSitePublic = asyncHandler(async (req, res) => {
  const { siteSlug } = req.params;
  const site = await getPublishedSiteBySlug(siteSlug);

  // pronadji homepage: preferiraj site.homepage, fallback na path:'/'
  const homepage = site.homepage
    ? await Page.findById(site.homepage)
    : await Page.findOne({ site: site._id, path: '/' });

  // dozvoli kratko keširanje
  res.set('Cache-Control', 'public, max-age=60');

  res.json({
    site: {
      _id: site._id,
      name: site.name,
      slug: site.slug,
      theme: site.theme,
      isPublished: site.isPublished,
      customDomain: site.customDomain || '',
    },
    homepage,
  });
});

/**
 * GET /api/public/:siteSlug/pages
 * Vraća listu *javnih* (isDraft:false) strana sa title i path.
 */
export const listPublicPages = asyncHandler(async (req, res) => {
  const { siteSlug } = req.params;
  const site = await getPublishedSiteBySlug(siteSlug);

  const items = await Page.find({ site: site._id, isDraft: false })
    .select('title path')
    .sort({ path: 1 });

  res.set('Cache-Control', 'public, max-age=60');
  res.json({ items });
});

/**
 * GET /api/public/:siteSlug/page?path=/about
 * Vraća jednu javnu stranicu po path-u (isDraft:false).
 */
export const getPublicPageByPath = asyncHandler(async (req, res) => {
  const { siteSlug } = req.params;
  const { path = '/' } = req.query;

  const site = await getPublishedSiteBySlug(siteSlug);
  const page = await Page.findOne({ site: site._id, path, isDraft: false });
  if (!page) {
    const e = new Error('Page not found');
    e.status = 404;
    throw e;
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.json({ page });
});

/**
 * GET /api/public/:siteSlug/posts?limit=12&cursor=<id>
 * Paginira OBJAVLJENE (status:'published') postove po sajtu.
 */
export const listPublicPosts = asyncHandler(async (req, res) => {
  const { siteSlug } = req.params;
  const { limit = 12, cursor } = req.query;

  const site = await getPublishedSiteBySlug(siteSlug);

  // uslov za objavljene postove
  const cond = { site: site._id, status: 'published' };
  if (cursor) cond._id = { $lt: cursor }; // keyset pagination

  const lim = Math.min(Number(limit) || 12, 50); // zaštita limita
  const items = await Post.find(cond)
    .sort({ _id: -1 })
    .limit(lim + 1)
    .select('title slug excerpt coverImageUrl publishedAt');

  // izračunaj nextCursor
  const nextCursor = items.length > lim ? String(items.pop()._id) : null;

  res.set('Cache-Control', 'public, max-age=30');
  res.json({ items, nextCursor });
});

/**
 * GET /api/public/:siteSlug/post/:slug
 * Vraća jedan OBJAVLJEN post po slugu na sajtu.
 */
export const getPublicPostBySlug = asyncHandler(async (req, res) => {
  const { siteSlug, slug } = req.params;
  const site = await getPublishedSiteBySlug(siteSlug);

  const post = await Post.findOne({
    site: site._id,
    slug,
    status: 'published',
  });
  if (!post) {
    const e = new Error('Post not found');
    e.status = 404;
    throw e;
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.json({ post });
});
