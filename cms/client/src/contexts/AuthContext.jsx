import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';
import { useLoading } from './LoadingContext';

// Kreira React Context za auth state (user, login, logout...)
const AuthContext = createContext(null);

// Provider koji inkapsulira auth logiku i izlaže metode/flagove kroz context
export function AuthProvider({ children }) {
  const { withLoading } = useLoading(); // helper za automatski loader
  const [user, setUser] = useState(null); // trenutno ulogovani korisnik (ili null)
  const [initializing, setInitializing] = useState(true); // flag tokom inicijalnog /me poziva

  // Na mount-u: pokušaj da dohvatiš /me (ako postoji važeći cookie, vrati user-a)
  useEffect(() => {
    withLoading(async () => {
      try {
        const data = await apiGet('/api/auth/me');
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setInitializing(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login metoda: poziva /api/auth/login i upisuje user state
  const login = async (email, password) => {
    const data = await withLoading(() =>
      apiPost('/api/auth/login', { email, password })
    );
    setUser(data.user);
    return data.user;
  };

  // Register metoda: poziva /api/auth/register i upisuje user state
  const register = async (fullName, email, password) => {
    const data = await withLoading(() =>
      apiPost('/api/auth/register', { fullName, email, password })
    );
    setUser(data.user);
    return data.user;
  };

  // Logout metoda: poziva /api/auth/logout i čisti user state
  const logout = async () => {
    await withLoading(() => apiPost('/api/auth/logout'));
    setUser(null);
  };

  // Memorisan value objekat koji dobijaju potrošači konteksta
  const value = useMemo(
    () => ({
      user, // objekat korisnika ili null
      initializing, // true dok traje inicijalni /me
      login, // funkcija za login
      register, // funkcija za registraciju
      logout, // funkcija za logout
      isAuthenticated: !!user, // true ako postoji user
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook za pristup auth kontekstu
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
