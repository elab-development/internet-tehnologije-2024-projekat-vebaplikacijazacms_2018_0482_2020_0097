// 404 handler: ako nijedna ruta nije pogodila, vraćamo JSON 404.
// Ovo treba da bude *poslednji* "normalni" middleware pre error handlera u server.js
export function notFound(_req, res, _next) {
  res.status(404).json({ error: 'Not found' });
}

// Globalni error handler za Express.
// Mora imati 4 parametra (err, req, res, next) da bi Express znao da je "error" middleware.
export function errorHandler(err, req, res, _next) {
  // Ako su headeri već poslati, prepusti Express-u da završi (izbegavamo "Cannot set headers after they are sent").
  if (res.headersSent) {
    return;
  }

  // Log na serveru – koristan za debug. U produkciji možeš uvesti logger (pino/winston).
  console.error(err);

  // 409: Duplicate key (Mongo 11000) – često kad unique indeks pukne (npr. email/slug).
  if (err?.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate key',
      details: err.keyValue,
    });
  }

  // 400: Mongoose ValidationError – schema validacije.
  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: Object.fromEntries(
        Object.entries(err.errors || {}).map(([k, v]) => [
          k,
          v?.message || 'Invalid',
        ])
      ),
    });
  }

  // 401: JWT greške iz jsonwebtoken paketa (ako negde propuste our middleware)
  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Ako je neko već setovao err.status (npr. u kontroleru), ispoštuj ga; inače 500.
  const status = err.status || 500;

  // U development okruženju možemo vratiti i stack za lakši debug.
  const isDev = (process.env.NODE_ENV || 'development') !== 'production';

  res.status(status).json({
    error: err.message || 'Server error',
    ...(isDev ? { stack: err.stack } : null),
  });
}
