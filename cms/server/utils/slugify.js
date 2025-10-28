// Pretvara proizvoljan string u "URL-safe" slug.
// - uklanja dijakritike (normalize + regex),
// - pretvara u lowercase,
// - pretvara ne-alfanumeričke u "-" i spaja višestruke "-",
// - uklanja "-" na početku/kraju.
// Opcije:
//   maxLength: broj karaktera (npr. 80) – preduge slugove skraćujemo.
//   fallback: ako rezultat ostane prazan, koristi fallback (npr. "item").
export function slugify(input = '', opts = {}) {
  const { maxLength = 0, fallback = 'item' } = opts;

  // 1) Normalizuj i ukloni dijakritike (NFKD + uklanjanje combining znakova)
  let out = String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  // 2) lower + trim okolnih razmaka
  out = out.toLowerCase().trim();

  // 3) sve što nije [a-z0-9] zamenjuj crticom
  out = out.replace(/[^a-z0-9]+/g, '-');

  // 4) ukloni vodeće/završne crtice i spoji duple
  out = out.replace(/-{2,}/g, '-').replace(/^[-]+|[-]+$/g, '');

  // 5) opcionalno skrati
  if (maxLength > 0 && out.length > maxLength) {
    out = out.slice(0, maxLength).replace(/[-]+$/g, ''); // ne završavaj crticom
  }

  // 6) fallback ako je ostalo prazno (npr. input bio emoji/simboli)
  if (!out) out = fallback;

  return out;
}
