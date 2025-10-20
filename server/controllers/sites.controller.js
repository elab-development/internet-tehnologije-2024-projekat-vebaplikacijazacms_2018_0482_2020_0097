import { User, Site, Page } from '../models/index.js'; // modeli
import { asyncHandler } from '../utils/asyncHandler.js'; // async wrapper
import { getTemplate } from '../templates/index.js'; // fabrika template blokova
import {
  loadSite,
  assertOwner,
  assertOwnerOrEditor,
} from '../middleware/permissions.js';

// POST /api/sites
export const createSite = asyncHandler(async (req, res) => {
  const { name, template = 'classic', theme, editors = [] } = req.body;
  if (!name) {
    const e = new Error('name is required');
    e.status = 400;
    throw e;
  }

  // validacija prosleđenih editor ID-jeva
  const editorsExist = await User.find({ _id: { $in: editors } }).select('_id');
  const editorIds = editorsExist.map((u) => u._id);

  // napravi sajt; trenutni korisnik je owner
  let site = await Site.create({
    name,
    template,
    theme,
    owners: [req.user.id],
    editors: editorIds,
  });

  // seed homepage iz šablona
  const blocks = getTemplate(template);
  const home = await Page.create({
    site: site._id,
    title: 'Home',
    path: '/',
    blocks,
    isDraft: false,
  });

  site.homepage = home._id; // poveži homepage
  await site.save();

  res.status(201).json({ site });
});

// GET /api/sites
export const listMySites = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // vrati sajtove gde je korisnik owner ili editor
  const items = await Site.find({
    $or: [{ owners: userId }, { editors: userId }],
  }).sort({ createdAt: -1 });

  res.json({ items });
});

// GET /api/sites/:id
export const getSite = asyncHandler(async (req, res) => {
  const site = await loadSite(req.params.id); // učitaj
  assertOwnerOrEditor(site, req.user.id, req.user.role); // dozvola
  res.json({ site });
});

// PUT /api/sites/:id
export const updateSite = asyncHandler(async (req, res) => {
  const site = await loadSite(req.params.id);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  const { name, theme, customDomain } = req.body;

  // selektivni update
  if (name !== undefined) site.name = name;
  if (theme !== undefined) site.theme = theme;
  if (customDomain !== undefined) site.customDomain = customDomain;

  await site.save();
  res.json({ site });
});

// DELETE /api/sites/:id
export const deleteSite = asyncHandler(async (req, res) => {
  const site = await loadSite(req.params.id);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  // obriši i povezane stranice i postove (kaskadno)
  await Promise.all([
    (await import('../models/Page.js')).default.deleteMany({ site: site._id }),
    (await import('../models/Post.js')).default.deleteMany({ site: site._id }),
  ]);

  await site.deleteOne();
  res.json({ ok: true });
});

// POST /api/sites/:id/publish
export const publishSite = asyncHandler(async (req, res) => {
  const site = await loadSite(req.params.id);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  site.isPublished = !!req.body.published; // true/false
  await site.save();
  res.json({ site });
});

// POST /api/sites/:id/editors
export const modifyEditors = asyncHandler(async (req, res) => {
  const site = await loadSite(req.params.id);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  const { userId, action } = req.body;
  if (!userId || !['add', 'remove'].includes(action)) {
    const e = new Error('userId & action(add|remove) required');
    e.status = 400;
    throw e;
  }

  if (action === 'add') {
    if (!site.editors.some((id) => String(id) === String(userId)))
      site.editors.push(userId);
  } else {
    site.editors = site.editors.filter((id) => String(id) !== String(userId));
  }

  await site.save();
  res.json({ site });
});

// GET /api/sites/:id/pages
export const listPagesOfSite = asyncHandler(async (req, res) => {
  const site = await loadSite(req.params.id);
  assertOwner(site, req.user.id, req.user.role); // samo owner/admin

  const pages = await Page.find({ site: site._id }).sort({ path: 1 });
  res.json({ items: pages });
});

// POST /api/sites/:id/autoblog
export const createBlogPage = asyncHandler(async (req, res) => {
  const site = await loadSite(req.params.id);
  assertOwner(site, req.user.id); // owner/admin guard (poziv bez role)

  // ako već postoji /blog, vrati postojeću
  let page = await Page.findOne({ site: site._id, path: '/blog' });
  if (page) return res.status(200).json({ page, created: false });

  // minimalni blokovi: naslov i postsList
  const blocks = [
    {
      id: 'sec-' + Date.now(),
      type: 'section',
      props: { bg: '#ffffff', pad: 16 },
      children: [
        {
          id: 't-' + Date.now(),
          type: 'text',
          props: { as: 'h1', value: 'Blog' },
        },
        {
          id: 'pl-' + Date.now(),
          type: 'postsList',
          props: {
            layout: 'grid', // grid | list
            limit: 12,
            showExcerpt: true,
            showDate: true,
          },
        },
      ],
    },
  ];

  // kreiraj /blog stranicu, odmah public (isDraft:false)
  page = await Page.create({
    site: site._id,
    title: 'Blog',
    path: '/blog',
    blocks,
    isDraft: false,
    seo: { title: `${site.name} • Blog` },
  });

  return res.status(201).json({ page, created: true });
});
