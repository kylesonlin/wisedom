import { Contact } from './contact';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate: Date;
  ownerId: string;
  teamMembers: ProjectMember[];
  contacts: ProjectContact[];
  tasks: Task[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'manager' | 'member';
  joinedAt: Date;
}

export interface ProjectContact {
  contactId: string;
  role: 'stakeholder' | 'client' | 'vendor' | 'partner';
  addedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[]; // Task IDs
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'upcoming' | 'in-progress' | 'completed';
  tasks: string[]; // Task IDs
} 