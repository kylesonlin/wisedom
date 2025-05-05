import React, { useState, useEffect } from 'react';
import { Sidebar, TopNav } from './ui/Navigation';
import { Card } from './ui/Card';

interface LayoutProps {
  children: React.ReactNode;
  navigationItems: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string;
    children?: Array<{
      label: string;
      href: string;
      icon?: React.ReactNode;
      badge?: string;
    }>;
  }>;
  activePath?: string;
  logo?: React.ReactNode;
  headerContent?: React.ReactNode;
  sidebarHeader?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
}

export function Layout({
  children,
  navigationItems,
  activePath,
  logo,
  headerContent,
  sidebarHeader,
  sidebarFooter,
}: LayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <TopNav
        items={navigationItems}
        activePath={activePath}
        logo={logo}
        rightContent={headerContent}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={navigationItems}
          activePath={activePath}
          header={sidebarHeader}
          footer={sidebarFooter}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto p-4">
          <Card className="h-full">{children}</Card>
        </main>
      </div>
    </div>
  );
} 