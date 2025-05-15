import { NormalizedContact } from '@/types/contact';

export const mockContacts: NormalizedContact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    normalizedEmail: 'john.doe@example.com',
    normalizedPhone: '1234567890',
    normalizedName: 'John Doe',
    source: 'test',
    confidence: 1.0,
    normalizationTimestamp: new Date(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      notifications: {
        email: true,
        push: true,
        frequency: 'daily'
      },
      privacy: {
        isPublic: false,
        sharedWith: []
      },
      display: {
        showAvatar: true,
        showStats: true,
        layout: 'detailed'
      },
      preferences: {
        contactMethod: 'email',
        timezone: 'UTC',
        language: 'en'
      }
    },
    originalValues: {
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '098-765-4321',
    normalizedEmail: 'jane.smith@example.com',
    normalizedPhone: '0987654321',
    normalizedName: 'Jane Smith',
    source: 'test',
    confidence: 1.0,
    normalizationTimestamp: new Date(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      notifications: {
        email: true,
        push: true,
        frequency: 'weekly'
      },
      privacy: {
        isPublic: true,
        sharedWith: ['team']
      },
      display: {
        showAvatar: true,
        showStats: true,
        layout: 'compact'
      },
      preferences: {
        contactMethod: 'any',
        timezone: 'UTC',
        language: 'en'
      }
    },
    originalValues: {
      email: 'jane.smith@example.com',
      phone: '098-765-4321',
      firstName: 'Jane',
      lastName: 'Smith'
    }
  }
];

export const mockInvalidContacts: any[] = [
  null,
  undefined,
  {
    id: '3',
    // Missing required fields
  }
];

export const mockDuplicateContacts: NormalizedContact[] = [
  {
    id: '4',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john.doe@example.com', // Same email as first contact
    phone: '123-456-7890',
    normalizedEmail: 'john.doe@example.com',
    normalizedPhone: '1234567890',
    normalizedName: 'John Doe',
    source: 'test',
    confidence: 1.0,
    normalizationTimestamp: new Date(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      notifications: {
        email: true,
        push: true,
        frequency: 'daily'
      },
      privacy: {
        isPublic: false,
        sharedWith: []
      },
      display: {
        showAvatar: true,
        showStats: true,
        layout: 'detailed'
      },
      preferences: {
        contactMethod: 'email',
        timezone: 'UTC',
        language: 'en'
      }
    },
    originalValues: {
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      firstName: 'John',
      lastName: 'Doe'
    }
  }
]; 