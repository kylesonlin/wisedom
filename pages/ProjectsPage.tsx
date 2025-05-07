import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
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
  return <div>Projects Page</div>;
} 