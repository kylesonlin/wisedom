"use client";

import React, { useState, useEffect } from 'react';
import { Contact } from '../types/contact';
import { Interaction } from '../types/interaction';
import { ActionItem } from '../utils/projectAnalytics';
import { 
  monitorContactUpdates, 
  calculateContactPriorities, 
  generatePriorityActionItems,
  ContactUpdate,
  ContactPriority
} from '../utils/contactMonitoring';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DailyUpdatesProps {
  contacts: Contact[];
  interactions: Interaction[];
}

export default function DailyUpdates({ contacts, interactions }: DailyUpdatesProps) {
  const [updates, setUpdates] = useState<ContactUpdate[]>([]);
  const [priorities, setPriorities] = useState<ContactPriority[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUpdates() {
      try {
        const newUpdates = monitorContactUpdates(contacts, interactions as unknown as import('../types/interaction').Interaction[]);
        const newPriorities = calculateContactPriorities(contacts, interactions as unknown as import('../types/interaction').Interaction[], newUpdates);
        const newActionItems = generatePriorityActionItems(contacts, newPriorities, newUpdates);

        setUpdates(newUpdates);
        setPriorities(newPriorities);
        setActionItems(newActionItems);
        setLoading(false);
      } catch (error) {
        console.error('Error loading updates:', error);
        setLoading(false);
      }
    }

    loadUpdates();

    // Refresh updates every hour
    const interval = setInterval(loadUpdates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [contacts, interactions]);

  if (loading) return <div className="p-4">Loading updates...</div>;

  const birthdays = updates.filter(update => update.type === 'birthday');
  const recentInteractions = updates.filter(update => update.type === 'interaction');

  const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();

  return (
    <div className="p-4 space-y-6">
      {/* Daily Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{updates.length}</div>
              <div className="text-muted-foreground">Total Updates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{birthdays.length}</div>
              <div className="text-muted-foreground">Upcoming Birthdays</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{actionItems.length}</div>
              <div className="text-muted-foreground">Action Items</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Birthdays */}
      {birthdays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Birthdays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {birthdays.map(update => {
                const contact = contacts.find(c => c.id === update.contactId);
                if (!contact) return null;

                return (
                  <div key={update.contactId} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{getFullName(contact)}</div>
                      <div className="text-sm text-muted-foreground">{update.details}</div>
                    </div>
                    <Badge variant={update.priority === 'high' ? 'destructive' : 'secondary'}>
                      {update.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Interactions */}
      {recentInteractions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentInteractions.map(update => {
                const contact = contacts.find(c => c.id === update.contactId);
                if (!contact) return null;

                return (
                  <div key={`${update.contactId}-${update.timestamp.getTime()}`} 
                       className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{getFullName(contact)}</div>
                      <div className="text-sm text-muted-foreground">{update.details}</div>
                    </div>
                    <Badge variant={
                      update.priority === 'high' ? 'destructive' :
                      update.priority === 'medium' ? 'secondary' :
                      'default'
                    }>
                      {update.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Action Items */}
      {actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actionItems.map(item => {
                const contact = contacts.find(c => c.id === item.contactId);
                if (!contact) return null;

                return (
                  <div key={item.id} className="p-2 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={
                          item.priority === 'high' ? 'destructive' :
                          item.priority === 'medium' ? 'secondary' :
                          'default'
                        }>
                          {item.priority}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm">
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 