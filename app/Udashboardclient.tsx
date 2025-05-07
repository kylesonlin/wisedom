"use client";

import React from 'react';
import MainLayout from '@/components/Umainlayout';
import AIActionSuggestions from '@/components/widgets/Uaiactionsuggestions';
import ActionItems from '@/components/widgets/Uactionitems';
import Birthdays from '@/components/widgets/Ubirthdays';
import RelationshipStrength from '@/components/widgets/Urelationshipstrength';

interface DashboardClientProps {
  userId: string;
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  if (!userId) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Please log in to view your dashboard</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <AIActionSuggestions userId={userId} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <ActionItems userId={userId} />
          </div>
          <div className="col-span-1">
            <div className="space-y-6">
              <Birthdays userId={userId} />
              <RelationshipStrength userId={userId} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 