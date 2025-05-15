"use client";

import React, { useEffect } from 'react';
import { useTheme } from '@/components/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

export default function ThemeTest() {
  const { theme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Theme Management Test</h2>
      
      {/* Theme Switcher */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Theme Switcher</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setTheme('light')}
            variant={theme === 'light' ? 'default' : 'outline'}
          >
            Light
          </Button>
          <Button
            onClick={() => setTheme('dark')}
            variant={theme === 'dark' ? 'default' : 'outline'}
          >
            Dark
          </Button>
          <Button
            onClick={() => setTheme('system')}
            variant={theme === 'system' ? 'default' : 'outline'}
          >
            System
          </Button>
        </div>
      </div>

      {/* Current Theme Display */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Current Theme</h3>
        <div className="p-4 border rounded-md">
          <p>Selected Theme: {theme}</p>
          <p>System Theme: {systemTheme}</p>
          <p>Effective Theme: {theme === 'system' ? systemTheme : theme}</p>
        </div>
      </div>

      {/* Theme Test Elements */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Theme Test Elements</h3>
        <div className="grid gap-4">
          {/* Buttons */}
          <div className="space-y-2">
            <h4 className="font-medium">Buttons</h4>
            <div className="flex gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            <h4 className="font-medium">Cards</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-md">
                <h5 className="font-medium">Card Title</h5>
                <p className="text-muted-foreground">Card content with some text</p>
              </div>
              <div className="p-4 border rounded-md bg-muted">
                <h5 className="font-medium">Muted Card</h5>
                <p className="text-muted-foreground">Card with muted background</p>
              </div>
            </div>
          </div>

          {/* Text Elements */}
          <div className="space-y-2">
            <h4 className="font-medium">Text Elements</h4>
            <div className="space-y-1">
              <p className="text-foreground">Regular text</p>
              <p className="text-muted-foreground">Muted text</p>
              <p className="text-primary">Primary text</p>
              <p className="text-secondary">Secondary text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 