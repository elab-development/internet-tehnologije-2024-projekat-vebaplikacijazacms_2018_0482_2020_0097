// mali wrapper koji svaku async Express rutu obavija u try/catch.
// Umesto da u svakoj ruti pišemo try/catch i zovemo next(err),
// ovde hvatamo reject-ovan Promise i prosleđujemo ga Express-ovom error middleware-u.
export const asyncHandler = (fn) => (req, res, next) =>
  // Promise.resolve omogućava da radi i sa sync i sa async funkcijama.
  // Ako fn baci ili vrati reject-ovan Promise, catch(next) će proslediti grešku.
  Promise.resolve(fn(req, res, next)).catch(next);
