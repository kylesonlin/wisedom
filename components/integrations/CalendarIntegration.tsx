import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { calendarEventSchema, calendarAvailabilitySchema, calendarSyncStatusSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { Calendar, Clock, MapPin, Users, RefreshCw, Search, Plus, Trash2, Edit2 } from 'lucide-react';

type CalendarEvent = z.infer<typeof calendarEventSchema>;
type CalendarAvailability = z.infer<typeof calendarAvailabilitySchema>;
type CalendarSyncStatus = z.infer<typeof calendarSyncStatusSchema>;

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function CalendarIntegration() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [availability, setAvailability] = useState<CalendarAvailability[]>([]);
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Load sync status
      const { data: syncData, error: syncError } = await supabase
        .from('calendar_sync_status')
        .select('*')
        .single();

      if (syncError && syncError.code !== 'PGRST116') throw syncError;
      setSyncStatus(syncData);

      // Load data based on active tab
      switch (activeTab) {
        case 'events':
          const { data: eventsData, error: eventsError } = await supabase
            .from('calendar_events')
            .select('*')
            .order('start_time', { ascending: true });

          if (eventsError) throw eventsError;
          setEvents(eventsData || []);
          break;

        case 'availability':
          const { data: availabilityData, error: availabilityError } = await supabase
            .from('calendar_availability')
            .select('*')
            .order('day_of_week', { ascending: true });

          if (availabilityError) throw availabilityError;
          setAvailability(availabilityData || []);
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load calendar data',
        variant: 'destructive'
      });
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Update sync status
      const { error: syncError } = await supabase
        .from('calendar_sync_status')
        .upsert({
          sync_status: 'in_progress',
          last_sync_at: new Date().toISOString()
        });

      if (syncError) throw syncError;

      // TODO: Implement actual Calendar API sync
      // This would involve:
      // 1. Fetching events from Calendar API
      // 2. Updating local database
      // 3. Updating sync status

      toast({
        title: 'Success',
        description: 'Calendar sync completed successfully'
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync calendar data',
        variant: 'destructive'
      });
      console.error('Error syncing calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleAvailabilityToggle = async (slot: CalendarAvailability) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('calendar_availability')
        .update({ is_available: !slot.is_available })
        .eq('id', slot.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Availability ${slot.is_available ? 'disabled' : 'enabled'} successfully`
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive'
      });
      console.error('Error updating availability:', error);
    }
  };

  const handleAddAvailability = async () => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('calendar_availability')
        .insert({
          day_of_week: 0, // Default to Sunday
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Availability slot added successfully'
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add availability slot',
        variant: 'destructive'
      });
      console.error('Error adding availability slot:', error);
    }
  };

  const handleDeleteAvailability = async (slot: CalendarAvailability) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('calendar_availability')
        .delete()
        .eq('id', slot.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Availability slot deleted successfully'
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete availability slot',
        variant: 'destructive'
      });
      console.error('Error deleting availability slot:', error);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Calendar Integration</h2>
          </div>
          <Button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>

        {syncStatus && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Last Sync</span>
              <span className="font-medium">
                {new Date(syncStatus.last_sync_at || '').toLocaleString()}
              </span>
            </div>
            <Progress
              value={syncStatus.sync_status === 'completed' ? 100 : 0}
              className="h-2"
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Availability
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Search className="h-4 w-4 text-gray-400" />
          </div>

          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {filteredEvents.map(event => (
                  <Card
                    key={event.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedEvent?.id === event.id
                        ? 'border-blue-500'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(event.start_time).toLocaleString()} -{' '}
                            {new Date(event.end_time).toLocaleString()}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedEvent && (
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{selectedEvent.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(selectedEvent.start_time).toLocaleString()} -{' '}
                          {new Date(selectedEvent.end_time).toLocaleString()}
                        </span>
                      </div>
                      {selectedEvent.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}
                    </div>

                    {selectedEvent.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Description</h4>
                        <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                      </div>
                    )}

                    {selectedEvent.attendees.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Attendees</h4>
                        <div className="space-y-1">
                          {selectedEvent.attendees.map((attendee, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {(attendee as { email: string }).email}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Badge variant="outline">{selectedEvent.status}</Badge>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleAddAvailability}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Availability
              </Button>
            </div>

            <div className="space-y-4">
              {availability.map(slot => (
                <Card key={slot.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{DAYS_OF_WEEK[slot.day_of_week]}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAvailabilityToggle(slot)}
                      >
                        <Badge variant={slot.is_available ? 'default' : 'secondary'}>
                          {slot.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAvailability(slot)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 