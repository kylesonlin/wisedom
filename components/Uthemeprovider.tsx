'use client';

import React, { createContext, useContext } from 'react';
import { theme, Theme } from '../styles/theme';

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
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

export function useColorMode() {
  const [colorMode, setColorMode] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    // Check for user preference
    const savedMode = localStorage.getItem('colorMode');
    if (savedMode === 'dark' || savedMode === 'light') {
      setColorMode(savedMode);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setColorMode('dark');
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('colorMode', newMode);
  };

  return { colorMode, toggleColorMode };
} 