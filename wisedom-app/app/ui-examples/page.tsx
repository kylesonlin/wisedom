'use client';

import React from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ExamplePage() {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Example Page</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Buttons</h2>
            <div className="flex gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Badges</h2>
            <div className="flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 