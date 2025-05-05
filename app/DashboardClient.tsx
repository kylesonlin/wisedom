"use client";

import React from 'react';
import MainLayout from '../components/MainLayout';
import AIActionSuggestions from '../components/widgets/AIActionSuggestions';
import ActionItems from '../components/widgets/ActionItems';
import Birthdays from '../components/widgets/Birthdays';
import RelationshipStrength from '../components/widgets/RelationshipStrength';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          {/* AI Action Suggestions Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <AIActionSuggestions userId={userId} />
          </div>
          {/* Action Items Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <ActionItems userId={userId} />
          </div>
        </div>
        <div className="col-span-1">
          {/* Birthdays Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <Birthdays userId={userId} />
          </div>
          {/* Relationship Strength Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <RelationshipStrength userId={userId} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 