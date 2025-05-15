"use client";

import ThemeTest from '@/components/ThemeTest';
import { ThemeProvider } from '@/components/contexts/ThemeContext';

export default function ThemeTestPage() {
  return (
    <ThemeProvider>
      <div className="container mx-auto py-8">
        <ThemeTest />
      </div>
    </ThemeProvider>
  );
} 