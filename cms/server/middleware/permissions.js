import { Site, Post } from '../models/index.js';

function isAdminRole(role) {
  return role === 'admin';
}

/**
 * loadSite(siteIdOrObj)
 * Učita Site po ID-ju ili vrati isti objekat ako je već dokument.
 * Baca 404 ako ne postoji.
 */
export async function loadSite(siteIdOrObj) {
  if (typeof siteIdOrObj === 'object' && siteIdOrObj?._id) return siteIdOrObj;
  const site = await Site.findById(siteIdOrObj);
  if (!site) {
    const e = new Error('Site not found');
    e.status = 404;
    throw e;
  }
  return site;
}

/**
 * assertOwner(site, userId, role = null)
 * Dozvoljava samo vlasnicima sajta ili adminu (admin bypass).
 */
export function assertOwner(site, userId, role = null) {
  // admin bypass
  if (isAdminRole(role ?? site?.__reqUserRole)) return;

  const ok = site.owners?.some((id) => String(id) === String(userId));
  if (!ok) {
    const e = new Error('Forbidden (owner only)');
    e.status = 403;
    throw e;
  }
}

/**
 * assertOwnerOrEditor(site, userId, role = null)
 * Dozvoljava vlasnicima ili editorima (ili adminu).
 */
export function assertOwnerOrEditor(site, userId, role = null) {
  // admin bypass
  if (isAdminRole(role ?? site?.__reqUserRole)) return;

  const owner = site.owners?.some((id) => String(id) === String(userId));
  const editor = site.editors?.some((id) => String(id) === String(userId));

  if (!owner && !editor) {
    const e = new Error('Forbidden (owner/editor)');
    e.status = 403;
    throw e;
  }
}

/**
 * assertAuthorOrOwner(postId, userId, role = null)
 * Dozvoljava autoru posta ili vlasniku sajta (ili adminu).
 * Vraća učitan Post dokument.
 */
export async function assertAuthorOrOwner(postId, userId, role = null) {
  const post = await Post.findById(postId);
  if (!post) {
    const e = new Error('Post not found');
    e.status = 404;
    throw e;
  }

  // admin bypass
  if (isAdminRole(role)) return post;

  const site = await Site.findById(post.site);
  const isAuthor = String(post.author) === String(userId);
  const isOwner = site?.owners?.some((id) => String(id) === String(userId));

  if (!isAuthor && !isOwner) {
    const e = new Error('Forbidden (author/owner)');
    e.status = 403;
    throw e;
  }
  return post;
}
