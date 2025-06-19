'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const THEME_COLORS = {
  lavender: { name: 'Lavender', value: '#D4B5E8' },
  mint: { name: 'Mint', value: '#B8E5D1' },
  peach: { name: 'Peach', value: '#FFDAB9' },
  sky: { name: 'Sky', value: '#C5E3F6' },
} as const;

export type ThemeColor = keyof typeof THEME_COLORS;

interface ThemeContextType {
  currentTheme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'mismetas-theme-color';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('lavender');

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeColor | null;
    if (savedTheme && savedTheme in THEME_COLORS) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-background', THEME_COLORS[currentTheme].value);
  }, [currentTheme]);

  const setTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}