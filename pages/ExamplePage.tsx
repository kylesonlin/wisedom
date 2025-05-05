import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    badge: '3',
  },
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Contacts',
    href: '/contacts',
    badge: '5',
  },
  {
    label: 'Analytics',
    href: '/analytics',
  },
];

export default function ExamplePage() {
  return (
    <Layout
      navigationItems={navigationItems}
      activePath="/dashboard"
      logo={<span className="text-xl font-bold">MyApp</span>}
      headerContent={
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Beta</Badge>
          <Button variant="ghost" size="sm">
            Profile
          </Button>
        </div>
      }
      sidebarHeader={
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary/10" />
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">john@example.com</p>
          </div>
        </div>
      }
      sidebarFooter={
        <Button variant="ghost" className="w-full justify-start">
          Settings
        </Button>
      }
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to your dashboard. Here's an overview of your activities.
        </p>
      </div>
    </Layout>
  );
} 