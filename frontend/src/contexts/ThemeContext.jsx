import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

const STORAGE_KEY = 'theme-preference';

const sanitizeTheme = (value) => {
  if (['light', 'dark', 'system'].includes(value)) {
    return value;
  }
  return 'system';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(STORAGE_KEY);
    return sanitizeTheme(stored);
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setThemeState(sanitizeTheme(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (value) => {
      const nextTheme = value === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : value;
      const root = document.documentElement;

      root.classList.toggle('dark', nextTheme === 'dark');
      root.classList.toggle('force-light', value === 'light');
      root.dataset.theme = nextTheme;
      root.style.colorScheme = nextTheme === 'dark' ? 'dark' : 'light';

      setResolvedTheme(nextTheme);
    };

    applyTheme(theme);

    if (theme === 'system') {
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    return undefined;
  }, [theme]);

  const setTheme = (value) => {
    const normalized = sanitizeTheme(value);
    setThemeState(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
