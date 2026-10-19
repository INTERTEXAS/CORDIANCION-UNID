import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unid-theme');
      if (saved) return saved;
      return 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('unid-theme', theme);
  }, [theme]);

  // Manejo de eventos de impresión: garantizar que cualquier impresión o guardado como PDF
  // se realice en tema claro, restaurando el modo oscuro intacto una vez finalizado el diálogo
  useEffect(() => {
    const handleBeforePrint = () => {
      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        root.setAttribute('data-print-restoredark', 'true');
      }
    };

    const handleAfterPrint = () => {
      const root = document.documentElement;
      if (root.getAttribute('data-print-restoredark') === 'true') {
        root.classList.add('dark');
        root.removeAttribute('data-print-restoredark');
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    let mediaQueryList = null;
    let mqlHandler = null;
    if (typeof window.matchMedia === 'function') {
      mediaQueryList = window.matchMedia('print');
      mqlHandler = (e) => {
        if (e.matches) {
          handleBeforePrint();
        } else {
          handleAfterPrint();
        }
      };
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', mqlHandler);
      } else if (mediaQueryList.addListener) {
        mediaQueryList.addListener(mqlHandler);
      }
    }

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      if (mediaQueryList && mqlHandler) {
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener('change', mqlHandler);
        } else if (mediaQueryList.removeListener) {
          mediaQueryList.removeListener(mqlHandler);
        }
      }
    };
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
}
