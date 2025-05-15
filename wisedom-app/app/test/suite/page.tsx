"use client";

import TestSuite from '@/components/TestSuite';
import { ThemeProvider } from '@/components/contexts/ThemeContext';

export default function TestSuitePage() {
  return (
    <ThemeProvider>
      <div className="container mx-auto py-8">
        <TestSuite />
      </div>
    </ThemeProvider>
  );
} 