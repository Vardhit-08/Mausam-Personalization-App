import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'mausam_theme_mode';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'dark';
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
    root.classList.add('theme-light');
    root.classList.remove('theme-dark');
  } else {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('theme-dark');
    root.classList.remove('theme-light');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    const handler = (e) => {
      if (e.detail && (e.detail === 'light' || e.detail === 'dark')) {
        setThemeState(e.detail);
      }
    };
    window.addEventListener('mausam-theme-change', handler);
    return () => window.removeEventListener('mausam-theme-change', handler);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // storage quota or disabled
    }
    setThemeState(newTheme);
    applyTheme(newTheme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mausam-theme-change', { detail: newTheme }));
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
