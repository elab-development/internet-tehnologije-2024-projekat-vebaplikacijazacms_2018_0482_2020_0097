import { Post, Site } from '../models/index.js'; // modeli Post i Site
import { asyncHandler } from '../utils/asyncHandler.js'; // async wrapper
import {
  loadSite,
  assertOwnerOrEditor, // owner ili editor (admin prolazi)
  assertAuthorOrOwner, // autor posta ili owner (admin prolazi)
} from '../middleware/permissions.js';

// POST /api/posts/site/:siteId
export const createPost = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const site = await loadSite(siteId); // učitaj sajt
  assertOwnerOrEditor(site, req.user.id, req.user.role); // owner/editor/admin

  // podaci za post
  const {
    title,
    slug,
    excerpt = '',
    coverImageUrl = '',
    blocks = [],
    status = 'draft',
  } = req.body;

  // obavezna polja
  if (!title || !slug) {
    const e = new Error('title and slug required');
    e.status = 400;
    throw e;
  }

  // provera unikatnosti slug-a unutar sajta
  const exists = await Post.findOne({ site: site._id, slug });
  if (exists) {
    const e = new Error('Slug already in use');
    e.status = 409;
    throw e;
  }

  // kreiraj post, autor = trenutni korisnik
  const post = await Post.create({
    site: site._id,
    author: req.user.id,
    title,
    slug,
    excerpt,
    coverImageUrl,
    blocks,
    status,
  });
  res.status(201).json({ post });
});

// GET /api/posts/site/:siteId
export const listPostsBySite = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const site = await loadSite(siteId);
  assertOwnerOrEditor(site, req.user.id, req.user.role); // owner/editor/admin

  // query parametri: status (draft/published), q (pretraga po title), paginacija
  const { status, q, limit = 20, cursor } = req.query;
  const cond = { site: site._id };
  if (status) cond.status = status;
  if (q) cond.title = { $regex: q, $options: 'i' };
  if (cursor) cond._id = { $lt: cursor }; // keyset pagination

  // dohvati +1 za određivanje nextCursor
  const items = await Post.find(cond)
    .sort({ _id: -1 })
    .limit(Number(limit) + 1);

  // kalkuliši nextCursor
  const nextCursor =
    items.length > Number(limit) ? String(items.pop()._id) : null;

  res.json({ items, nextCursor });
});

// GET /api/posts/:postId
export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId); // nadji post
  if (!post) {
    const e = new Error('Post not found');
    e.status = 404;
    throw e;
  }
  const site = await Site.findById(post.site); // parent sajt
  assertOwnerOrEditor(site, req.user.id, req.user.role); // owner/editor/admin
  res.json({ post });
});

// PUT /api/posts/:postId
export const updatePost = asyncHandler(async (req, res) => {
  // autor ili owner (admin prolazi)
  const post = await assertAuthorOrOwner(
    req.params.postId,
    req.user.id,
    req.user.role
  );

  const { title, slug, excerpt, coverImageUrl, blocks, status } = req.body;

  // promena slug-a: provera kolizije u okviru istog sajta
  if (slug && slug !== post.slug) {
    const exists = await Post.findOne({ site: post.site, slug });
    if (exists) {
      const e = new Error('Slug already in use');
      e.status = 409;
      throw e;
    }
    post.slug = slug;
  }

  // selektivna izmena polja
  if (title !== undefined) post.title = title;
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (coverImageUrl !== undefined) post.coverImageUrl = coverImageUrl;
  if (blocks !== undefined) post.blocks = blocks;
  if (status !== undefined) post.status = status;

  await post.save();
  res.json({ post });
});

// POST /api/posts/:postId/publish
export const publishPost = asyncHandler(async (req, res) => {
  // autor ili owner
  const post = await assertAuthorOrOwner(
    req.params.postId,
    req.user.id,
    req.user.role
  );

  // postavi status i datum objave
  post.status = req.body.published ? 'published' : 'draft';
  post.publishedAt = req.body.published ? new Date() : undefined;

  await post.save();
  res.json({ post });
});

// DELETE /api/posts/:postId
export const deletePost = asyncHandler(async (req, res) => {
  // autor ili owner
  const post = await assertAuthorOrOwner(
    req.params.postId,
    req.user.id,
    req.user.role
  );
  await post.deleteOne(); // obriši dokument
  res.json({ ok: true });
});
