image.png"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { ThemeProvider } from '@/components/contexts/ThemeContext';
import MainLayout from './MainLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const router = useRouter();

  return (
    <ThemeProvider>
      <MainLayout>{children}</MainLayout>
    </ThemeProvider>
  );
} 