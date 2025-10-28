import bcrypt from 'bcrypt'; // biblioteka za heširanje lozinki
import { User } from '../models/index.js'; // Mongoose model User
import { asyncHandler } from '../utils/asyncHandler.js'; // wrapper za hvatanje grešaka u async rutama
import {
  signToken, // potpisuje JWT
  setAuthCookie, // postavlja httpOnly cookie sa JWT
  clearAuthCookie, // briše cookie (logout)
} from '../middleware/auth.js';

// helper koji bira samo sigurna polja za klijenta
const pickUser = (u) => ({
  id: u._id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // osnovna validacija obaveznih polja
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: 'fullName, email i password su obavezni' });
  }

  // spreči dupliranje email-a
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists)
    return res.status(409).json({ error: 'Email je već registrovan' });

  // određivanje role:
  // - prvi korisnik može biti admin (ako u body-ju traži 'admin')
  // - ako već postoji admin u req.user i prosleđena je role, prihvati je
  let finalRole = 'user';
  const userCount = await User.countDocuments();
  if (userCount === 0 && role === 'admin') finalRole = 'admin';
  else if (role && req.user?.role === 'admin') finalRole = role;

  // heširanje lozinke
  const passwordHash = await bcrypt.hash(password, 12);

  // kreiranje korisnika
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    role: finalRole,
  });

  // generiši token i postavi u cookie
  const token = signToken({ id: user._id, role: user.role, email: user.email });
  setAuthCookie(res, token);

  // vrati minimalni profil
  res.status(201).json({ user: pickUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validacija inputa
  if (!email || !password)
    return res.status(400).json({ error: 'email i password su obavezni' });

  // pronadji korisnika
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Neispravni kredencijali' });

  // uporedi lozinku sa hešom
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Neispravni kredencijali' });

  // setuj JWT cookie i vrati profil
  const token = signToken({ id: user._id, role: user.role, email: user.email });
  setAuthCookie(res, token);
  res.json({ user: pickUser(user) });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res); // briše auth cookie
  res.json({ ok: true });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = await User.findById(req.user.id); // dohvat iz baze po id iz JWT-a
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: pickUser(user) }); // vrati minimalni profil
});
