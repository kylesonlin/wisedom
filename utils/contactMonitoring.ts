import { Contact } from '../types/contact';
import { Interaction } from '../types/contact';
import { ActionItem } from './projectAnalytics';
import { calculatePriorityScore } from './aiAnalysis';

export interface ContactUpdate {
  contactId: string;
  type: 'interaction' | 'birthday' | 'anniversary' | 'status-change';
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  details: string;
  actionNeeded: boolean;
}

export interface ContactPriority {
  contactId: string;
  priorityScore: number;
  lastInteraction: Date;
  interactionFrequency: number;
  sentimentScore: number;
  relationshipStrength: number;
  pendingActions: number;
  upcomingEvents: number;
}

export function monitorContactUpdates(
  contacts: Contact[],
  interactions: Interaction[],
  currentDate: Date = new Date()
): ContactUpdate[] {
  const updates: ContactUpdate[] = [];

  // Check for birthdays
  contacts.forEach(contact => {
    if (contact.birthday) {
      const birthday = new Date(contact.birthday);
      const nextBirthday = new Date(
        currentDate.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      );

      // If birthday is within next 7 days
      const daysUntilBirthday = Math.ceil(
        (nextBirthday.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
        updates.push({
          contactId: contact.id,
          type: 'birthday',
          timestamp: nextBirthday,
          priority: daysUntilBirthday <= 3 ? 'high' : 'medium',
          details: `Birthday in ${daysUntilBirthday} days`,
          actionNeeded: true,
        });
      }
    }
  });

  // Check for recent interactions
  interactions.forEach(interaction => {
    const hoursSinceInteraction = Math.ceil(
      (currentDate.getTime() - interaction.timestamp.getTime()) / (1000 * 60 * 60)
    );

    if (hoursSinceInteraction <= 24) {
      updates.push({
        contactId: interaction.contact_id,
        type: 'interaction',
        timestamp: interaction.timestamp,
        priority: 'medium',
        details: `New ${interaction.type}: ${interaction.summary}`,
        actionNeeded: false,
      });
    }
  });

  return updates;
}

export function calculateContactPriorities(
  contacts: Contact[],
  interactions: Interaction[],
  updates: ContactUpdate[]
): ContactPriority[] {
  return contacts.map(contact => {
    const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
    const contactUpdates = updates.filter(u => u.contactId === contact.id);
    
    const lastInteraction = contactInteractions.length > 0
      ? new Date(Math.max(...contactInteractions.map(i => i.timestamp.getTime())))
      : new Date(0);

    const interactionFrequency = contactInteractions.length / 30; // Interactions per month
    const sentimentScores = contactInteractions.map(i => i.sentiment || 0);
    const averageSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
      : 0;

    const pendingActions = contactUpdates.filter(u => u.actionNeeded).length;
    const upcomingEvents = contactUpdates.filter(u => 
      u.type === 'birthday' || u.type === 'anniversary'
    ).length;

    const priorityScore = calculatePriorityScore(
      contact,
      contactInteractions,
      contactUpdates
    );

    return {
      contactId: contact.id,
      priorityScore,
      lastInteraction,
      interactionFrequency,
      sentimentScore: averageSentiment,
      relationshipStrength: 0,
      pendingActions,
      upcomingEvents,
    };
  });
}

export function generatePriorityActionItems(
  contacts: Contact[],
  priorities: ContactPriority[],
  updates: ContactUpdate[]
): ActionItem[] {
  const actionItems: ActionItem[] = [];

  priorities.forEach(priority => {
    const contact = contacts.find(c => c.id === priority.contactId);
    if (!contact) return;

    const contactUpdates = updates.filter(u => u.contactId === contact.id);
    const highPriorityUpdates = contactUpdates.filter(u => u.priority === 'high');
    const mediumPriorityUpdates = contactUpdates.filter(u => u.priority === 'medium');

    // Create action items for high priority updates
    highPriorityUpdates.forEach(update => {
      actionItems.push({
        id: `update-${update.contactId}-${update.timestamp.getTime()}`,
        type: 'follow-up',
        title: `Follow up with ${contact.name}`,
        description: update.details,
        priority: 'high',
        dueDate: new Date(update.timestamp.getTime() + 24 * 60 * 60 * 1000), // 24 hours
        assignedTo: contact.assignedTo || '',
        contactId: contact.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Create action items for medium priority updates
    mediumPriorityUpdates.forEach(update => {
      actionItems.push({
        id: `update-${update.contactId}-${update.timestamp.getTime()}`,
        type: 'follow-up',
        title: `Follow up with ${contact.name}`,
        description: update.details,
        priority: 'medium',
        dueDate: new Date(update.timestamp.getTime() + 72 * 60 * 60 * 1000), // 72 hours
        assignedTo: contact.assignedTo || '',
        contactId: contact.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Create action item for relationship building if needed
    if (priority.relationshipStrength < 0.5 && priority.interactionFrequency < 0.5) {
      actionItems.push({
        id: `relationship-${contact.id}`,
        type: 'meeting',
        title: `Build relationship with ${contact.name}`,
        description: 'Schedule a check-in to strengthen the relationship',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        assignedTo: contact.assignedTo || '',
        contactId: contact.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return actionItems.sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
} 