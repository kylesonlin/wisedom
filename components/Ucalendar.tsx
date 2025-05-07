import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/calendar/auth/status');
      const { authenticated } = await response.json();
      setIsAuthenticated(authenticated);
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const handleAuth = async () => {
    try {
      const response = await fetch('/api/calendar/auth');
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError('Failed to authenticate with Google Calendar');
      console.error('Auth error:', err);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      setError('Failed to fetch calendar events');
      console.error('Fetch events error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      const data = await response.json();
      setEvents([...events, data.event]);
    } catch (err) {
      setError('Failed to create calendar event');
      console.error('Create event error:', err);
    }
  };

  return (
    <div className="calendar">
      <div className="calendar__header">
        <h2 className="calendar__title">Calendar</h2>
        {!isAuthenticated ? (
          <button
            className="calendar__auth-button"
            onClick={handleAuth}
          >
            Connect Google Calendar
          </button>
        ) : (
          <button
            className="calendar__refresh-button"
            onClick={fetchEvents}
            disabled={isLoading}
          >
            Refresh Events
          </button>
        )}
      </div>

      {error && (
        <div className="calendar__error">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="calendar__loading">
          <p>Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="calendar__events">
          {events.map((event) => (
            <div key={event.id} className="calendar__event">
              <h3 className="calendar__event-title">{event.summary}</h3>
              <p className="calendar__event-time">
                {new Date(event.start.dateTime).toLocaleString()} -{' '}
                {new Date(event.end.dateTime).toLocaleString()}
              </p>
              {event.description && (
                <p className="calendar__event-description">{event.description}</p>
              )}
              {event.attendees && event.attendees.length > 0 && (
                <div className="calendar__event-attendees">
                  <h4>Attendees:</h4>
                  <ul>
                    {event.attendees.map((attendee, index) => (
                      <li key={index}>
                        {attendee.displayName || attendee.email}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="calendar__empty">
          <p>No events found</p>
        </div>
      )}

      <style jsx>{`
        .calendar {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .calendar__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .calendar__title {
          font-size: 1.5rem;
          color: #333;
        }

        .calendar__auth-button,
        .calendar__refresh-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background-color: #4285f4;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .calendar__auth-button:hover,
        .calendar__refresh-button:hover {
          background-color: #3367d6;
        }

        .calendar__refresh-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .calendar__error {
          padding: 10px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .calendar__loading,
        .calendar__empty {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .calendar__events {
          display: grid;
          gap: 20px;
        }

        .calendar__event {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: white;
        }

        .calendar__event-title {
          margin: 0 0 10px 0;
          font-size: 1.2rem;
          color: #333;
        }

        .calendar__event-time {
          color: #666;
          margin-bottom: 10px;
        }

        .calendar__event-description {
          color: #444;
          margin-bottom: 10px;
        }

        .calendar__event-attendees {
          margin-top: 10px;
        }

        .calendar__event-attendees h4 {
          margin: 0 0 5px 0;
          font-size: 1rem;
          color: #333;
        }

        .calendar__event-attendees ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .calendar__event-attendees li {
          color: #666;
          margin-bottom: 3px;
        }
      `}</style>
    </div>
  );
};

export default Calendar; 