import { createContext, useContext, useMemo, useState } from 'react';

// Kreira kontekst za globalni loading state (brojač aktivnih zahteva)
const LoadingContext = createContext(null);

// Provider koji izlaže loading flag, kao i helper-e za upravljanje njime
export function LoadingProvider({ children }) {
  const [count, setCount] = useState(0); // brojač paralelnih "loading" operacija

  // Inkrement brojača pri startu
  const start = () => setCount((c) => c + 1);
  // Dekrement brojača po završetku (ne dozvoli ispod nule)
  const stop = () => setCount((c) => Math.max(0, c - 1));

  // Wrapper koji automatski start/stop-uje loader oko asinhrone funkcije
  const withLoading = async (fn) => {
    start();
    try {
      return await fn();
    } finally {
      stop();
    }
  };

  // Memorisan value: loading flag + pomoćne metode
  const value = useMemo(
    () => ({
      loading: count > 0, // true ako je bar jedna operacija aktivna
      startLoading: start, // ručno startovanje loader-a
      stopLoading: stop, // ručno gašenje loader-a
      withLoading, // helper za async operacije
    }),
    [count]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

// Hook za pristup loading kontekstu
export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}
