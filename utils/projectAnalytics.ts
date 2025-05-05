import { Project, Task, Milestone, ProjectMember, ProjectContact } from '../types/project';
import { Contact } from '../types/contact';
import { Interaction } from '../types/interaction';

export interface ProjectAnalytics {
  projectId: string;
  completionRate: number;
  taskDistribution: {
    todo: number;
    inProgress: number;
    review: number;
    completed: number;
  };
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  teamMemberActivity: {
    userId: string;
    completedTasks: number;
    activeTasks: number;
    lastActive: Date;
  }[];
  contactEngagement: {
    contactId: string;
    interactionCount: number;
    lastInteraction: Date;
    sentimentScore: number;
  }[];
  milestoneProgress: {
    milestoneId: string;
    completedTasks: number;
    totalTasks: number;
    progress: number;
  }[];
  timeline: {
    date: Date;
    events: {
      type: 'task' | 'milestone' | 'interaction';
      id: string;
      title: string;
      status: string;
    }[];
  }[];
}

export interface ActionItem {
  id: string;
  type: 'task' | 'follow-up' | 'meeting' | 'review';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  assignedTo: string;
  projectId?: string;
  contactId?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export async function calculateProjectAnalytics(
  project: Project,
  contacts: Contact[],
  interactions: Interaction[]
): Promise<ProjectAnalytics> {
  // Calculate task distribution
  const taskDistribution = {
    todo: project.tasks.filter(t => t.status === 'todo').length,
    inProgress: project.tasks.filter(t => t.status === 'in-progress').length,
    review: project.tasks.filter(t => t.status === 'review').length,
    completed: project.tasks.filter(t => t.status === 'completed').length,
  };

  // Calculate priority distribution
  const priorityDistribution = {
    high: project.tasks.filter(t => t.priority === 'high').length,
    medium: project.tasks.filter(t => t.priority === 'medium').length,
    low: project.tasks.filter(t => t.priority === 'low').length,
  };

  // Calculate team member activity
  const teamMemberActivity = project.teamMembers.map(member => {
    const memberTasks = project.tasks.filter(t => t.assigneeId === member.userId);
    return {
      userId: member.userId,
      completedTasks: memberTasks.filter(t => t.status === 'completed').length,
      activeTasks: memberTasks.filter(t => t.status !== 'completed').length,
      lastActive: new Date(Math.max(...memberTasks.map(t => t.updatedAt.getTime()))),
    };
  });

  // Calculate contact engagement
  const contactEngagement = project.contacts.map(projectContact => {
    const contact = contacts.find(c => c.id === projectContact.contactId);
    const contactInteractions = interactions.filter(i => i.contactId === projectContact.contactId);
    const sentimentScores = contactInteractions.map(i => i.sentiment || 0);
    const averageSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
      : 0;

    return {
      contactId: projectContact.contactId,
      interactionCount: contactInteractions.length,
      lastInteraction: new Date(Math.max(...contactInteractions.map(i => i.timestamp.getTime()))),
      sentimentScore: averageSentiment,
    };
  });

  // Calculate milestone progress
  const milestoneProgress = project.milestones.map(milestone => {
    const milestoneTasks = project.tasks.filter(t => milestone.tasks.includes(t.id));
    return {
      milestoneId: milestone.id,
      completedTasks: milestoneTasks.filter(t => t.status === 'completed').length,
      totalTasks: milestoneTasks.length,
      progress: milestoneTasks.length > 0
        ? (milestoneTasks.filter(t => t.status === 'completed').length / milestoneTasks.length) * 100
        : 0,
    };
  });

  // Create timeline
  const timeline = [
    ...project.tasks.map(task => ({
      date: task.dueDate,
      events: [{
        type: 'task' as const,
        id: task.id,
        title: task.title,
        status: task.status,
      }],
    })),
    ...project.milestones.map(milestone => ({
      date: milestone.dueDate,
      events: [{
        type: 'milestone' as const,
        id: milestone.id,
        title: milestone.title,
        status: milestone.status,
      }],
    })),
    ...interactions.map(interaction => ({
      date: interaction.timestamp,
      events: [{
        type: 'interaction' as const,
        id: interaction.id,
        title: interaction.type,
        status: interaction.status,
      }],
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate overall completion rate
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    projectId: project.id,
    completionRate,
    taskDistribution,
    priorityDistribution,
    teamMemberActivity,
    contactEngagement,
    milestoneProgress,
    timeline,
  };
}

export function generateActionItems(
  project: Project,
  contacts: Contact[],
  interactions: Interaction[]
): ActionItem[] {
  const actionItems: ActionItem[] = [];

  // Generate action items from tasks
  project.tasks.forEach(task => {
    if (task.status !== 'completed') {
      actionItems.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedTo: task.assigneeId,
        projectId: project.id,
        status: task.status === 'todo' ? 'pending' : 'in-progress',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    }
  });

  // Generate action items from interactions
  interactions.forEach(interaction => {
    if (interaction.followUpNeeded) {
      actionItems.push({
        id: `followup-${interaction.id}`,
        type: 'follow-up',
        title: `Follow up with ${contacts.find(c => c.id === interaction.contactId)?.name}`,
        description: `Follow up regarding: ${interaction.summary}`,
        priority: interaction.priority,
        dueDate: new Date(interaction.timestamp.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from interaction
        assignedTo: interaction.userId,
        contactId: interaction.contactId,
        status: 'pending',
        createdAt: interaction.timestamp,
        updatedAt: interaction.timestamp,
      });
    }
  });

  // Generate action items from milestones
  project.milestones.forEach(milestone => {
    if (milestone.status !== 'completed') {
      const milestoneTasks = project.tasks.filter(t => milestone.tasks.includes(t.id));
      const incompleteTasks = milestoneTasks.filter(t => t.status !== 'completed');
      
      if (incompleteTasks.length > 0) {
        actionItems.push({
          id: `milestone-${milestone.id}`,
          type: 'review',
          title: `Review milestone: ${milestone.title}`,
          description: `${incompleteTasks.length} tasks remaining for this milestone`,
          priority: 'high',
          dueDate: milestone.dueDate,
          assignedTo: project.ownerId,
          projectId: project.id,
          status: 'pending',
          createdAt: milestone.dueDate,
          updatedAt: milestone.dueDate,
        });
      }
    }
  });

  return actionItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
} 