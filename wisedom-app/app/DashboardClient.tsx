"use client";

import React from 'react';
import MainLayout from '@/components/MainLayout';
import AIActionSuggestions from '@/components/AIActionSuggestions';
import ActionItems from '@/components/ActionItems';
import RelationshipStrength from '@/components/RelationshipStrength';
import { FollowUpSuggestion } from '@/utils/aiAnalysis';

interface DashboardClientProps {
  userId: string;
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  const defaultSuggestions: FollowUpSuggestion[] = [
    {
      id: '1',
      contactId: 'contact-1',
      contactName: 'John Doe',
      type: 'meeting',
      priority: 'high',
      reason: 'Based on recent interactions, it might be good to schedule a follow-up meeting with the client.',
      suggestedAction: 'Schedule a follow-up meeting',
      suggestedTime: new Date(),
      confidence: 0.8,
    },
    {
      id: '2',
      contactId: 'contact-2',
      contactName: 'Jane Smith',
      type: 'email',
      priority: 'medium',
      reason: 'The project timeline needs to be updated to reflect recent changes.',
      suggestedAction: 'Send an email with updated timeline',
      suggestedTime: new Date(),
      confidence: 0.6,
    },
    {
      id: '3',
      contactId: 'contact-3',
      contactName: 'Bob Johnson',
      type: 'call',
      priority: 'low',
      reason: 'Some documentation needs to be reviewed for accuracy.',
      suggestedAction: 'Schedule a call to review documentation',
      suggestedTime: new Date(),
      confidence: 0.4,
    },
  ];

  const handleActionSelect = (suggestion: FollowUpSuggestion) => {
    console.log('Action selected for suggestion:', suggestion);
  };

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
            <AIActionSuggestions suggestions={defaultSuggestions} onActionSelect={handleActionSelect} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <ActionItems />
          </div>
          <div className="col-span-1">
            <div className="space-y-6">
              <RelationshipStrength />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 