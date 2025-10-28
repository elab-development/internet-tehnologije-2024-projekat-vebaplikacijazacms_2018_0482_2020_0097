import { User } from '../models/index.js'; // Mongoose model User
import { asyncHandler } from '../utils/asyncHandler.js'; // async wrapper

// GET /api/users?q=...&ids=...&limit=...
export const listUsers = asyncHandler(async (req, res) => {
  const { q = '', ids = '', limit = 20 } = req.query;

  // definicija polja koja vraćamo (projekcija)
  const sel = '_id fullName email role createdAt';
  const lim = Math.min(Number(limit) || 20, 100);

  let cond = {}; // uslov pretrage

  if (ids) {
    // ako su prosleđeni ID-jevi, filtriraj po listi
    const arr = ids
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!arr.length) return res.json({ items: [] });
    cond = { _id: { $in: arr } };
  } else if (q) {
    // inače, tekstualna pretraga po fullName/email (case-insensitive)
    cond = {
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    };
  }

  // izvrši upit sa sortiranjem i limitom
  const items = await User.find(cond)
    .select(sel)
    .sort({ createdAt: -1 })
    .limit(lim);

  res.json({ items });
});
