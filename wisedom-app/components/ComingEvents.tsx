'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'conference' | 'networking' | 'workshop' | 'webinar';
  status: 'upcoming' | 'ongoing' | 'completed';
  industry: string;
  metadata?: {
    organizer?: string;
    website?: string;
    registrationDeadline?: string;
    capacity?: number;
    registeredCount?: number;
    virtual?: boolean;
    tags?: string[];
  };
}

const typeColors = {
  conference: 'bg-blue-100 text-blue-800',
  networking: 'bg-purple-100 text-purple-800',
  workshop: 'bg-green-100 text-green-800',
  webinar: 'bg-orange-100 text-orange-800',
};

const statusColors = {
  upcoming: 'bg-green-100 text-green-800',
  ongoing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
};

export default function UpcomingEvents() {
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'startDate' | 'type'>('startDate');

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('userId', user?.id)
        .order('startDate', { ascending: true });

      if (error) throw error;

      // Update event statuses based on current date
      const now = new Date();
      const updatedEvents = data.map((event: Event) => ({
        ...event,
        status: getEventStatus(event.startDate, event.endDate),
      }));

      setEvents(updatedEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (startDate: string, endDate: string): Event['status'] => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now > end) return 'completed';
    if (now >= start && now <= end) return 'ongoing';
    return 'upcoming';
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.industry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedType || event.type === selectedType;
      const matchesStatus = !selectedStatus || event.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedType(null)}
              className={!selectedType ? 'bg-gray-100' : ''}
            >
              All Types
            </Button>
            {Object.keys(typeColors).map(type => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => setSelectedType(type)}
                className={selectedType === type ? 'bg-gray-100' : ''}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="startDate">Sort by Date</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No events found
            </div>
          ) : (
            filteredEvents.map(event => (
              <div
                key={event.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Location: {event.location}</span>
                  <span>Industry: {event.industry}</span>
                </div>
                {event.metadata && (
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                    {event.metadata.organizer && (
                      <span>Organizer: {event.metadata.organizer}</span>
                    )}
                    {event.metadata.registrationDeadline && (
                      <span>Registration: {new Date(event.metadata.registrationDeadline).toLocaleDateString()}</span>
                    )}
                    {event.metadata.capacity && (
                      <span>Capacity: {event.metadata.registeredCount || 0}/{event.metadata.capacity}</span>
                    )}
                    {event.metadata.virtual !== undefined && (
                      <span>Type: {event.metadata.virtual ? 'Virtual' : 'In-Person'}</span>
                    )}
                  </div>
                )}
                {event.metadata?.tags && event.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {event.metadata.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  {event.metadata?.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(event.metadata?.website, '_blank')}
                    >
                      Visit Website
                    </Button>
                  )}
                  {event.status === 'upcoming' && event.metadata?.registrationDeadline && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(event.metadata?.website, '_blank')}
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
} 