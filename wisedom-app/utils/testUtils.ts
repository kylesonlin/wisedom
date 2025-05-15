import { Project, Task, Milestone, ProjectMember } from '@/types/project';
import { Contact } from '@/types/contact';
import { Interaction } from '@/types/interaction';

// Mock data generators
export const generateMockProject = (overrides = {}): Project => ({
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
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2024-03-01'),
      assigneeId: 'user1',
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
      status: 'upcoming',
      tasks: []
    }
  ],
  teamMembers: [
    { userId: 'user1', role: 'member', joinedAt: new Date('2024-01-01') },
    { userId: 'user2', role: 'member', joinedAt: new Date('2024-01-01') }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
});

export const generateMockContact = (overrides = {}): Contact => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Test Corp',
  phone: '123-456-7890',
  notes: 'Test contact',
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  relationships: [{
    userId: 'user1',
    type: 'primary',
    permissions: ['view', 'edit', 'delete']
  }],
  ...overrides
});

export const generateMockInteraction = (overrides = {}): Interaction => ({
  id: '1',
  userId: 'user1',
  contactId: '1',
  type: 'meeting',
  timestamp: new Date('2024-01-15').toISOString(),
  notes: 'Test meeting',
  sentiment: 0.8,
  topics: [],
  content: 'Test interaction content',
  summary: 'Test interaction summary',
  priority: 'medium',
  status: 'completed',
  followUpNeeded: false,
  ...overrides
});

// Test scenarios
export const testScenarios = {
  loading: {
    project: null,
    contacts: null,
    interactions: null,
    loading: true,
    error: null
  },
  error: {
    project: null,
    contacts: null,
    interactions: null,
    loading: false,
    error: 'Failed to load data'
  },
  empty: {
    project: generateMockProject({ tasks: [], milestones: [] }),
    contacts: [],
    interactions: [],
    loading: false,
    error: null
  },
  normal: {
    project: generateMockProject(),
    contacts: [generateMockContact()],
    interactions: [generateMockInteraction()],
    loading: false,
    error: null
  },
  large: {
    project: generateMockProject({
      tasks: Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Test task ${i}`,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2024-03-01'),
        assigneeId: 'user1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        dependencies: [],
        comments: []
      }))
    }),
    contacts: Array.from({ length: 50 }, (_, i) => generateMockContact({ id: `contact-${i}` })),
    interactions: Array.from({ length: 200 }, (_, i) => generateMockInteraction({ id: `interaction-${i}` })),
    loading: false,
    error: null
  }
};

// Performance testing utilities
export const measurePerformance = async (callback: () => void | Promise<void>): Promise<number> => {
  const start = performance.now();
  await callback();
  const end = performance.now();
  return end - start;
};

// Responsive testing utilities
export const viewportSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

// Browser compatibility testing
export const browserFeatures = {
  webSocket: typeof window !== 'undefined' && typeof WebSocket !== 'undefined',
  localStorage: typeof window !== 'undefined' && typeof localStorage !== 'undefined',
  indexedDB: typeof window !== 'undefined' && typeof indexedDB !== 'undefined',
  serviceWorker: typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator
};

// Environment variable testing
export const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// Security testing utilities
export const securityChecks = {
  xss: (input: string): boolean => {
    const dangerous = /<script|javascript:|on\w+=/i;
    return !dangerous.test(input);
  },
  csrf: (token: string): boolean => {
    return token.length > 0;
  }
}; 