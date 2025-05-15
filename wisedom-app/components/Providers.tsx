'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
    </AuthProvider>
  );
} 