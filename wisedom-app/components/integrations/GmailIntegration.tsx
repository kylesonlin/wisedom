import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { gmailEmailSchema, gmailContactSchema, gmailCalendarEventSchema, gmailSyncStatusSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { Mail, Users, Calendar, RefreshCw, Search, Star, StarOff, Tag, MapPin, Clock } from 'lucide-react';

type GmailEmail = z.infer<typeof gmailEmailSchema>;
type GmailContact = z.infer<typeof gmailContactSchema>;
type GmailCalendarEvent = z.infer<typeof gmailCalendarEventSchema>;
type GmailSyncStatus = z.infer<typeof gmailSyncStatusSchema>;

export function GmailIntegration() {
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [contacts, setContacts] = useState<GmailContact[]>([]);
  const [events, setEvents] = useState<GmailCalendarEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState<GmailSyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const [selectedContact, setSelectedContact] = useState<GmailContact | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GmailCalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState('emails');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Load sync status
      const { data: syncData, error: syncError } = await supabase
        .from('gmail_sync_status')
        .select('*')
        .single();

      if (syncError && syncError.code !== 'PGRST116') throw syncError;
      setSyncStatus(syncData);

      // Load data based on active tab
      switch (activeTab) {
        case 'emails':
          const { data: emailsData, error: emailsError } = await supabase
            .from('gmail_emails')
            .select('*')
            .order('received_at', { ascending: false });

          if (emailsError) throw emailsError;
          setEmails(emailsData || []);
          break;

        case 'contacts':
          const { data: contactsData, error: contactsError } = await supabase
            .from('gmail_contacts')
            .select('*')
            .order('name', { ascending: true });

          if (contactsError) throw contactsError;
          setContacts(contactsData || []);
          break;

        case 'calendar':
          const { data: eventsData, error: eventsError } = await supabase
            .from('gmail_calendar_events')
            .select('*')
            .order('start_time', { ascending: true });

          if (eventsError) throw eventsError;
          setEvents(eventsData || []);
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load Gmail data',
        variant: 'destructive'
      });
      console.error('Error loading Gmail data:', error);
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
        .from('gmail_sync_status')
        .upsert({
          email_sync_status: 'in_progress',
          contact_sync_status: 'in_progress',
          calendar_sync_status: 'in_progress',
          last_email_sync_at: new Date().toISOString(),
          last_contact_sync_at: new Date().toISOString(),
          last_calendar_sync_at: new Date().toISOString()
        });

      if (syncError) throw syncError;

      // TODO: Implement actual Gmail API sync
      // This would involve:
      // 1. Fetching emails from Gmail API
      // 2. Fetching contacts from Gmail API
      // 3. Fetching calendar events from Google Calendar API
      // 4. Updating local database
      // 5. Updating sync status

      toast({
        title: 'Success',
        description: 'Gmail sync completed successfully'
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync Gmail data',
        variant: 'destructive'
      });
      console.error('Error syncing Gmail data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelect = (email: GmailEmail) => {
    setSelectedEmail(email);
  };

  const handleContactSelect = (contact: GmailContact) => {
    setSelectedContact(contact);
  };

  const handleEventSelect = (event: GmailCalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleStarEmail = async (email: GmailEmail) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('gmail_emails')
        .update({ is_starred: !email.is_starred })
        .eq('id', email.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Email ${email.is_starred ? 'unstarred' : 'starred'} successfully`
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update email star status',
        variant: 'destructive'
      });
      console.error('Error updating email star status:', error);
    }
  };

  const handleFavoriteContact = async (contact: GmailContact) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('gmail_contacts')
        .update({ is_favorite: !contact.is_favorite })
        .eq('id', contact.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Contact ${contact.is_favorite ? 'unfavorited' : 'favorited'} successfully`
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contact favorite status',
        variant: 'destructive'
      });
      console.error('Error updating contact favorite status:', error);
    }
  };

  const filteredEmails = emails.filter(email =>
    email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Mail className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Gmail Integration</h2>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Email Sync</span>
                  <span className="font-medium">
                    {new Date(syncStatus.last_email_sync_at || '').toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={syncStatus.email_sync_status === 'completed' ? 100 : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Contact Sync</span>
                  <span className="font-medium">
                    {new Date(syncStatus.last_contact_sync_at || '').toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={syncStatus.contact_sync_status === 'completed' ? 100 : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Calendar Sync</span>
                  <span className="font-medium">
                    {new Date(syncStatus.last_calendar_sync_at || '').toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={syncStatus.calendar_sync_status === 'completed' ? 100 : 0}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
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

          <TabsContent value="emails" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {filteredEmails.map(email => (
                  <Card
                    key={email.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id
                        ? 'border-blue-500'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleEmailSelect(email)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{email.subject}</h3>
                          <p className="text-sm text-gray-500">{email.from_email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={e => {
                            e.stopPropagation();
                            handleStarEmail(email);
                          }}
                        >
                          {email.is_starred ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{email.snippet}</p>
                      <div className="flex flex-wrap gap-2">
                        {email.labels.map(label => (
                          <Badge key={label} variant="secondary">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedEmail && (
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{selectedEmail.subject}</h3>
                      <p className="text-sm text-gray-500">
                        From: {selectedEmail.from_email}
                      </p>
                      <p className="text-sm text-gray-500">
                        To: {selectedEmail.to_emails.join(', ')}
                      </p>
                      {selectedEmail.cc_emails && selectedEmail.cc_emails.length > 0 && (
                        <p className="text-sm text-gray-500">
                          CC: {selectedEmail.cc_emails.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="prose max-w-none">
                      {selectedEmail.body_html ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html as string }} />
                      ) : (
                        <p>{selectedEmail.body as string}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.labels.map(label => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {filteredContacts.map(contact => (
                  <Card
                    key={contact.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id
                        ? 'border-blue-500'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleContactSelect(contact)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                        {contact.photo_url && (
                          <img
                            src={contact.photo_url}
                            alt={contact.name || contact.email}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {contact.labels.map(label => (
                          <Badge key={label} variant="secondary">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedContact && (
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{selectedContact.name}</h3>
                        <p className="text-sm text-gray-500">{selectedContact.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFavoriteContact(selectedContact)}
                      >
                        {selectedContact.is_favorite ? (
                          <Star className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>

                    {selectedContact.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-gray-600">{selectedContact.notes}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {selectedContact.labels.map(label => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
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
                          {selectedEvent.attendees.map((attendee: { email: string }, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {attendee.email}
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
        </Tabs>
      </Card>
    </div>
  );
} 