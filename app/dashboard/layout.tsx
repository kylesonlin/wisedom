import React from 'react';
import { DashboardGridLayout } from '@/components/dashboard/DashboardLayout';
import { Sidebar } from '@/components/ui/Sidebar';

interface DashboardRootLayoutProps {
  children: React.ReactNode;
}

export default function DashboardRootLayout({
  children,
}: DashboardRootLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <DashboardGridLayout>{children}</DashboardGridLayout>
        </div>
      </main>
    </div>
  );
}
