import jwt from 'jsonwebtoken';

// Ime kolačića koji nosi access token.
const cookieName = process.env.COOKIE_NAME || 'ddcms_token';

/**
 * signToken(payload)
 * Potpisuje JWT sa definisanim exp (JWT_EXPIRES_IN), secret-om i meta poljima.
 * - payload bi trebalo da bude *minimalan* (npr. { id, role, email }).
 * - expiresIn: "7d" po difoltu (možeš promeniti u .env).
 */
export function signToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn,
  });
}

/**
 * setAuthCookie(res, token)
 * Postavlja httpOnly kolačić sa JWT-om.
 * - httpOnly: JS ga ne može čitati (XSS zaštita)
 * - secure: true u produkciji (HTTPS obavezno za SameSite=None)
 * - sameSite: 'none' u prod (za cross-site scenarioe), 'lax' u dev
 * - maxAge: 7 dana (usklađeno sa JWT exp; možeš da čitaš exp iz tokena i računaš)
 */
export function setAuthCookie(res, token) {
  const isProd = (process.env.COOKIE_SECURE || 'false') === 'true';
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
  });
}

/**
 * clearAuthCookie(res)
 * Briše auth kolačić (na logout-u).
 */
export function clearAuthCookie(res) {
  const isProd = (process.env.COOKIE_SECURE || 'false') === 'true';
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

/**
 * requireAuth(req, res, next)
 * Guard koji zahteva validan JWT.
 * - Token se čita iz httpOnly kolačića ili iz Authorization: Bearer <token>
 * - Ako je validan: req.user = decoded (npr. { id, role, email, iat, exp })
 */
export function requireAuth(req, res, next) {
  // 1) Izvuci token iz kolačića ili Authorization headera
  const token =
    req.cookies?.[cookieName] ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 2) Verifikuj i dekoduj
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    // 3) Zakači podatke o korisniku na req (i opciono na res.locals)
    req.user = decoded; // { id, role, email, ... }
    // res.locals.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * requireRole(...roles)
 * Guard koji zahteva da req.user.role pripada skupu dozvoljenih rola.
 * Primer upotrebe: router.post('/admin-only', requireAuth, requireRole('admin'), handler)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
