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
  priority: 'medium',
  ownerId: 'user1',
  contacts: [],
  tasks: [
    {
      id: '1',
      title: 'Task 1',
      description: 'Test task 1',
      status: 'inuprogress',
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
      dueDate: new Date('2024-04-01'),
      status: 'upcoming',
      tasks: []
    }
  ],
  teamMembers: [
    { userId: 'user1', role: 'member', joinedAt: new Date('2024-01-01') },
    { userId: 'user2', role: 'member', joinedAt: new Date('2024-01-01') }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Example Corp',
    phone: '123-456-7890',
    notes: 'Test contact',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Example Inc',
    phone: '987-654-3210',
    notes: 'Test contact 2',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockInteractions: Interaction[] = [
  {
    id: '1',
    type: 'meeting',
    contactId: '1',
    userId: 'user1',
    timestamp: new Date('2024-01-15').toISOString(),
    content: 'Test meeting',
    summary: 'Test meeting summary',
    sentiment: 0.8,
    priority: 'high',
    status: 'completed',
    followUpNeeded: false,
    notes: 'Test meeting',
    topics: []
  },
  {
    id: '2',
    type: 'email',
    contactId: '2',
    userId: 'user1',
    timestamp: new Date('2024-01-20').toISOString(),
    content: 'Test email',
    summary: 'Test email summary',
    sentiment: 0.5,
    priority: 'medium',
    status: 'completed',
    followUpNeeded: true,
    followUpDate: new Date('2024-02-01').toISOString(),
    notes: 'Test email',
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
    } as Project;
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