'use client';

import React from 'react';
import DashboardLayout from '@/app/components/Layout';
import { Button, Badge, Card } from '@/components/ui';
import { BarChart, LineChart, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="mt-2 text-muted-foreground">
          View your project and contact analytics.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Project Progress</h3>
            </div>
            <div className="mt-4 h-40 bg-muted rounded" />
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <LineChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Contact Growth</h3>
            </div>
            <div className="mt-4 h-40 bg-muted rounded" />
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Task Distribution</h3>
            </div>
            <div className="mt-4 h-40 bg-muted rounded" />
          </Card>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h3 className="font-semibold">Recent Activity</h3>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10" />
                  <div>
                    <p className="text-sm font-medium">Activity {item}</p>
                    <p className="text-xs text-muted-foreground">
                      Description of activity {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold">Upcoming Deadlines</h3>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Deadline {item}</p>
                    <p className="text-xs text-muted-foreground">
                      Due in {item} days
                    </p>
                  </div>
                  <Badge variant="secondary">High Priority</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 