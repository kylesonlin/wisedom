"use client";

import React, { useState } from 'react';
import ContactDashboard from '@/components/ContactDashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function ContactDashboardTest() {
  const [view, setView] = useState<'list' | 'grid' | 'timeline'>('list');
  const [testMode, setTestMode] = useState<'normal' | 'loading' | 'error'>('normal');

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Contact Dashboard Test</h2>

      {/* Test Controls */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Test Controls</h3>
        
        {/* View Switcher */}
        <div className="space-y-2">
          <h4 className="font-medium">View Type</h4>
          <div className="flex gap-2">
            <Button
              onClick={() => setView('list')}
              variant={view === 'list' ? 'default' : 'outline'}
            >
              List View
            </Button>
            <Button
              onClick={() => setView('grid')}
              variant={view === 'grid' ? 'default' : 'outline'}
            >
              Grid View
            </Button>
            <Button
              onClick={() => setView('timeline')}
              variant={view === 'timeline' ? 'default' : 'outline'}
            >
              Timeline View
            </Button>
          </div>
        </div>

        {/* Test Mode */}
        <div className="space-y-2">
          <h4 className="font-medium">Test Mode</h4>
          <div className="flex gap-2">
            <Button
              onClick={() => setTestMode('normal')}
              variant={testMode === 'normal' ? 'default' : 'outline'}
            >
              Normal
            </Button>
            <Button
              onClick={() => setTestMode('loading')}
              variant={testMode === 'loading' ? 'default' : 'outline'}
            >
              Loading
            </Button>
            <Button
              onClick={() => setTestMode('error')}
              variant={testMode === 'error' ? 'default' : 'outline'}
            >
              Error
            </Button>
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Test Instructions</h3>
        <div className="space-y-2">
          <h4 className="font-medium">1. Basic Functionality</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Verify contacts load and display correctly</li>
            <li>Test search functionality with different queries</li>
            <li>Check view switching (list/grid/timeline)</li>
            <li>Verify contact details display correctly</li>
          </ul>

          <h4 className="font-medium">2. Filtering & Sorting</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Test all filter options</li>
            <li>Verify sort functionality</li>
            <li>Check filter combinations</li>
            <li>Test saved views</li>
          </ul>

          <h4 className="font-medium">3. Analytics</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Verify priority scores calculate correctly</li>
            <li>Check interaction analyses display</li>
            <li>Test follow-up suggestions</li>
            <li>Verify statistics display</li>
          </ul>

          <h4 className="font-medium">4. Error States</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Test loading state</li>
            <li>Verify error handling</li>
            <li>Check empty states</li>
            <li>Test network error recovery</li>
          </ul>
        </div>
      </div>

      {/* Contact Dashboard */}
      <div className="border rounded-md">
        <ContactDashboard initialView={view} />
      </div>
    </div>
  );
} 