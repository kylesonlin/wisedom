"use client";

import React, { useState } from 'react';
import ProjectAnalytics from '@/components/ProjectAnalytics';
import { Button } from '@/components/ui/Button';
import { Project, Task, Milestone, ProjectMember } from '@/types/project';
import { Contact } from '@/types/contact';
import { Interaction } from '@/types/interaction';

// Mock data for testing
const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'A test project for analytics',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  status: 'inuprogress',
  tasks: [
    {
      id: '1',
      title: 'Task 1',
      description: 'Test task 1',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2024-03-01'),
      assigneeId: 'user1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      dependencies: [],
      comments: []
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Test task 2',
      status: 'inuprogress',
      priority: 'medium',
      dueDate: new Date('2024-03-15'),
      assigneeId: 'user2',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      dependencies: [],
      comments: []
    }
  ],
  milestones: [
    {
      id: '1',
      title: 'Milestone 1',
      description: 'Test milestone 1',
      dueDate: new Date('2024-06-30'),
      status: 'upcoming'
    }
  ],
  teamMembers: [
    { id: 'user1', name: 'User 1', role: 'developer' },
    { id: 'user2', name: 'User 2', role: 'designer' }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    company: 'Test Corp',
    phone: '123-456-7890',
    notes: 'Test contact'
  }
];

const mockInteractions: Interaction[] = [
  {
    id: '1',
    contactId: '1',
    type: 'meeting',
    timestamp: new Date('2024-01-15'),
    notes: 'Test meeting',
    sentiment: 0.8,
    topics: []
  }
];

export default function ProjectAnalyticsTest() {
  const [testMode, setTestMode] = useState<'normal' | 'loading' | 'error'>('normal');
  const [mockData, setMockData] = useState({
    project: mockProject,
    contacts: mockContacts,
    interactions: mockInteractions
  });

  // Simulate real-time updates
  const simulateUpdate = () => {
    const updatedProject = {
      ...mockData.project,
      tasks: mockData.project.tasks.map(task => ({
        ...task,
        status: task.status === 'todo' ? 'inuprogress' : 'todo'
      }))
    };
    setMockData(prev => ({ ...prev, project: updatedProject }));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Project Analytics Test</h2>

      {/* Test Controls */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Test Controls</h3>
        
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

        {/* Simulate Updates */}
        <div className="space-y-2">
          <h4 className="font-medium">Simulate Updates</h4>
          <Button onClick={simulateUpdate}>
            Simulate Task Status Update
          </Button>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Test Instructions</h3>
        <div className="space-y-2">
          <h4 className="font-medium">1. Charts & Visualizations</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Verify task distribution chart renders correctly</li>
            <li>Check priority distribution chart</li>
            <li>Test burndown chart with different timeframes</li>
            <li>Verify velocity chart updates</li>
          </ul>

          <h4 className="font-medium">2. Real-time Updates</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Test task status updates</li>
            <li>Verify chart animations</li>
            <li>Check data consistency</li>
            <li>Test WebSocket connection</li>
          </ul>

          <h4 className="font-medium">3. Data Loading</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Verify loading states</li>
            <li>Test error handling</li>
            <li>Check data refresh</li>
            <li>Verify empty states</li>
          </ul>

          <h4 className="font-medium">4. Performance</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Test chart rendering performance</li>
            <li>Check memory usage</li>
            <li>Verify animation smoothness</li>
            <li>Test with large datasets</li>
          </ul>
        </div>
      </div>

      {/* Project Analytics */}
      <div className="border rounded-md">
        <ProjectAnalytics
          project={mockData.project}
          contacts={mockData.contacts}
          interactions={mockData.interactions}
        />
      </div>
    </div>
  );
} 