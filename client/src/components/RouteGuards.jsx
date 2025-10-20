import { Navigate, Outlet } from 'react-router-dom'; // Outlet renderuje ugnježdene rute; Navigate radi redirect
import { useAuth } from '../contexts/AuthContext';

// Guard: dozvoljava pristup samo ulogovanim korisnicima
export function RequireAuth() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return null; // dok se proverava /me, ne renderuj ništa
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />; // ako nije ulogovan -> login
}

// Guard: dozvoljava pristup samo gostima (neulogovanima)
export function RequireGuest() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return null;
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' replace />; // ako je ulogovan -> home
}

// Guard: dozvoljava pristup samo admin korisnicima (na osnovu user.role)
export function RequireAdmin() {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (!user) return <Navigate to='/login' replace />; // ako nema user-a -> login
  return user.role === 'admin' ? <Outlet /> : <Navigate to='/' replace />; // ako nije admin -> home
}
