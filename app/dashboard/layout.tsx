import React from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/Sidebar';

interface DashboardRootLayoutProps {
  children: React.ReactNode;
}

export default function DashboardRootLayout({
  children,
}: DashboardRootLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
