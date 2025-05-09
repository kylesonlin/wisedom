"use client"

// Copied and adapted from enhanced-dashboard/app/page.tsx
// TODO: Update imports to use the new-dashboard components and UI primitives

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import DashboardLayout from '@/app/components/new-dashboard/DashboardLayout';
import { useWidgets } from '@/hooks/useWidgets';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function NewDashboard() {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();
  const { widgets, loading, error, toggleWidget, reorderWidget } = useWidgets(user?.id ?? '');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardLayout
          widgets={widgets}
          onWidgetToggle={toggleWidget}
          onWidgetReorder={reorderWidget}
        />
      </div>
    </ThemeProvider>
  );
} 