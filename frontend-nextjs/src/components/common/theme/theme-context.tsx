'use client';

import { createContext, useContext } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { ThemeContextValue } from './types';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const themeContext = useNextTheme();

  return (
    <ThemeContext.Provider value={themeContext}>
      {children}
    </ThemeContext.Provider>
  );
}
