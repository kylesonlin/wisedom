import { FollowUpSuggestion } from './contactPrioritization';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description: string;
  attendees: string[];
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export async function createCalendarEvent(
  suggestion: FollowUpSuggestion,
  contactEmail: string,
  calendarType: 'google' | 'outlook' = 'google'
): Promise<CalendarEvent> {
  try {
    const event: CalendarEvent = {
      id: '', // Will be set by the calendar service
      title: `Follow-up with ${suggestion.contactId}`,
      startTime: suggestion.suggestedTime,
      endTime: new Date(suggestion.suggestedTime.getTime() + 30 * 60 * 1000), // 30 minutes
      description: `Follow-up reason: ${suggestion.reason}\nType: ${suggestion.type}\nPriority: ${suggestion.priority}`,
      attendees: [contactEmail],
      status: 'confirmed'
    };

    if (calendarType === 'google') {
      // In a real implementation, you would use the Google Calendar API
      // For now, we'll use a mock implementation
      event.id = `google-${Date.now()}`;
      console.log('Creating Google Calendar event:', event);
    } else {
      // In a real implementation, you would use the Microsoft Graph API
      // For now, we'll use a mock implementation
      event.id = `outlook-${Date.now()}`;
      console.log('Creating Outlook Calendar event:', event);
    }

    return event;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEvent>,
  calendarType: 'google' | 'outlook' = 'google'
): Promise<CalendarEvent> {
  try {
    // In a real implementation, you would update the event using the appropriate calendar API
    // For now, we'll use a mock implementation
    console.log('Updating calendar event:', { eventId, updates, calendarType });
    return {
      id: eventId,
      title: updates.title || '',
      startTime: updates.startTime || new Date(),
      endTime: updates.endTime || new Date(),
      description: updates.description || '',
      attendees: updates.attendees || [],
      status: updates.status || 'confirmed'
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(
  eventId: string,
  calendarType: 'google' | 'outlook' = 'google'
): Promise<void> {
  try {
    // In a real implementation, you would delete the event using the appropriate calendar API
    // For now, we'll use a mock implementation
    console.log('Deleting calendar event:', { eventId, calendarType });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

export async function syncCalendarEvents(
  calendarType: 'google' | 'outlook' = 'google',
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    // In a real implementation, you would fetch events from the calendar API
    // For now, we'll use a mock implementation
    console.log('Syncing calendar events:', { calendarType, startDate, endDate });
    return [];
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    throw error;
  }
}

export async function checkCalendarAvailability(
  contactEmail: string,
  startDate: Date,
  endDate: Date,
  calendarType: 'google' | 'outlook' = 'google'
): Promise<{ available: boolean; suggestedTimes: Date[] }> {
  try {
    // In a real implementation, you would check availability using the calendar API
    // For now, we'll use a mock implementation
    console.log('Checking calendar availability:', {
      contactEmail,
      startDate,
      endDate,
      calendarType
    });

    // Generate some mock suggested times
    const suggestedTimes: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (currentDate.getHours() >= 9 && currentDate.getHours() <= 17) {
        suggestedTimes.push(new Date(currentDate));
      }
      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }

    return {
      available: suggestedTimes.length > 0,
      suggestedTimes: suggestedTimes.slice(0, 5) // Return up to 5 suggested times
    };
  } catch (error) {
    console.error('Error checking calendar availability:', error);
    throw error;
  }
} 