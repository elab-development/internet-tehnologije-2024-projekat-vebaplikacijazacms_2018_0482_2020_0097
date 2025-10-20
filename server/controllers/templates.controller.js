import { TEMPLATES, getTemplate } from '../templates/index.js'; // mapa i helper za templejte
import { asyncHandler } from '../utils/asyncHandler.js'; // async wrapper

// GET /api/templates
export const listTemplates = asyncHandler(async (_req, res) => {
  // vrati listu imena dostupnih templejta
  res.json({ items: Object.keys(TEMPLATES) });
});

// GET /api/templates/:name
export const getTemplateByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const tpl = getTemplate(name); // dohvati blokove za traženi templejt
  res.json({ name, blocks: tpl }); // vrati ime i blokove
});
