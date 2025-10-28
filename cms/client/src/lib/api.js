// Bazni URL za backend API; čita iz VITE_API_URL ili pada na localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Jedinstveni handler za odgovor: pokuša da parse-uje JSON; ako status nije OK, baca Error
async function handle(res) {
  const data = await res.json().catch(() => ({})); // fallback na {} ako nije validan JSON
  if (!res.ok) {
    const msg = data?.error || data?.message || 'Request failed';
    const error = new Error(msg);
    error.status = res.status; // HTTP status šifra
    error.data = data; // telo sa servera (korisno za detalje)
    throw error;
  }
  return data;
}

// GET helper – uključuje credentials (cookie) i Content-Type header
export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    credentials: 'include', // šalje/briše httpOnly cookie
    headers: { 'Content-Type': 'application/json' },
  });
  return handle(res);
}

// POST helper – šalje JSON body
export async function apiPost(path, body = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

// PUT helper – šalje JSON body
export async function apiPut(path, body = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

// DELETE helper
export async function apiDelete(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  return handle(res);
}

// Upload helper – koristi FormData (bez Content-Type, browser ga sam postavlja sa boundary)
export async function apiUpload(path, formData) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handle(res);
}
