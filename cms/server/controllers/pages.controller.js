import { Page } from '../models/index.js'; // Mongoose model Page
import { asyncHandler } from '../utils/asyncHandler.js'; // async wrapper
import { loadSite, assertOwner } from '../middleware/permissions.js'; // helpers za dozvole

// POST /api/pages/site/:siteId
export const createPage = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const site = await loadSite(siteId); // učitaj sajt
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin može

  const { title, path, blocks = [], seo = {}, isDraft = true } = req.body;
  if (!title || !path) {
    const e = new Error('title and path required');
    e.status = 400;
    throw e;
  }

  // kreiraj stranicu
  const page = await Page.create({
    site: site._id,
    title,
    path,
    blocks,
    seo,
    isDraft,
  });
  res.status(201).json({ page });
});

// GET /api/pages/:pageId
export const getPage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.pageId); // nadji stranicu
  if (!page) {
    const e = new Error('Page not found');
    e.status = 404;
    throw e;
  }
  const site = await loadSite(page.site); // učitaj parent sajt
  assertOwner(site, req.user.id, req.user.role); // pristup owner/admin
  res.json({ page });
});

// PUT /api/pages/:pageId
export const updatePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.pageId);
  if (!page) {
    const e = new Error('Page not found');
    e.status = 404;
    throw e;
  }
  const site = await loadSite(page.site);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  // selektivna izmena polja
  const { title, path, blocks, seo, isDraft } = req.body;
  if (title !== undefined) page.title = title;
  if (path !== undefined) page.path = path;
  if (blocks !== undefined) page.blocks = blocks;
  if (seo !== undefined) page.seo = seo;
  if (isDraft !== undefined) page.isDraft = !!isDraft;

  await page.save();
  res.json({ page });
});

// DELETE /api/pages/:pageId
export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.pageId);
  if (!page) {
    const e = new Error('Page not found');
    e.status = 404;
    throw e;
  }
  const site = await loadSite(page.site);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  // zabrani brisanje homepage-a
  if (String(site.homepage) === String(page._id)) {
    const e = new Error('Cannot delete homepage. Change site homepage first.');
    e.status = 400;
    throw e;
  }

  await page.deleteOne();
  res.json({ ok: true });
});

// POST /api/pages/:pageId/duplicate
export const duplicatePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.pageId);
  if (!page) {
    const e = new Error('Page not found');
    e.status = 404;
    throw e;
  }
  const site = await loadSite(page.site);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  // iz body-ja dozvoli promenu path/title kopije, inače dodaj sufiks
  const { newPath = page.path + '-copy', newTitle = page.title + ' (Copy)' } =
    req.body || {};

  // napravi kopiju kao draft
  const copy = await Page.create({
    site: site._id,
    title: newTitle,
    path: newPath,
    blocks: page.blocks,
    seo: page.seo,
    isDraft: true,
  });
  res.status(201).json({ page: copy });
});

// POST /api/pages/site/:siteId/homepage
export const setHomepage = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const { pageId } = req.body;

  const site = await loadSite(siteId);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  // validiraj da stranica pripada sajtu
  const page = await Page.findById(pageId);
  if (!page || String(page.site) !== String(site._id)) {
    const e = new Error('Page not found on this site');
    e.status = 404;
    throw e;
  }

  site.homepage = page._id; // setuj homepage
  await site.save();
  res.json({ site });
});
