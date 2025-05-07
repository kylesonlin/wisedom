import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

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
  return <div>Example Page</div>;
} 