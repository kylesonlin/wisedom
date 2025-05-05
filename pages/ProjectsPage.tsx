import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Folder, Plus } from 'lucide-react';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    badge: '3',
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: <Folder className="h-4 w-4" />,
    children: [
      {
        label: 'Active',
        href: '/projects/active',
        badge: '5',
      },
      {
        label: 'Completed',
        href: '/projects/completed',
        badge: '12',
      },
      {
        label: 'Archived',
        href: '/projects/archived',
      },
    ],
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

export default function ProjectsPage() {
  return (
    <Layout
      navigationItems={navigationItems}
      activePath="/projects/active"
      logo={<span className="text-xl font-bold">MyApp</span>}
      headerContent={
        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
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
        <h1 className="text-2xl font-bold">Active Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your active projects and track their progress.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((project) => (
            <Card key={project} className="p-4">
              <h3 className="font-semibold">Project {project}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Project description and details go here.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary">In Progress</Badge>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
} 