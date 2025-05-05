import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabase';
import { Contact } from '../../types/contact';
import { Interaction } from '../../types/interaction';
import { ActionItem } from '../../utils/aiAnalysis';

interface ActionItemsProps {
  userId: string;
}

export default function ActionItems({ userId }: ActionItemsProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActionItems();
  }, [userId]);

  const loadActionItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      
      // Load contacts and interactions
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*');
      if (contactsError) throw contactsError;

      const { data: interactions, error: interactionsError } = await supabase
        .from('interactions')
        .select('*');
      if (interactionsError) throw interactionsError;

      // Generate action items based on contact and interaction data
      const items: ActionItem[] = [];
      
      // Example logic for generating action items
      // In a real implementation, this would use your AI analysis functions
      for (const contact of contacts || []) {
        const contactInteractions = interactions?.filter(i => i.contact_id === contact.id) || [];
        
        // Check for upcoming birthdays
        if (contact.birthday) {
          const birthday = new Date(contact.birthday);
          const today = new Date();
          const daysUntilBirthday = Math.floor(
            (new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate()).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
            items.push({
              id: `birthday-${contact.id}`,
              type: 'birthday',
              title: `${contact.name}'s Birthday`,
              description: `Birthday in ${daysUntilBirthday} days`,
              priority: daysUntilBirthday <= 3 ? 'high' : 'medium',
              dueDate: new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate()),
              contactId: contact.id,
              contactName: contact.name,
              status: 'pending',
              completed: false
            });
          }
        }

        // Check for follow-ups needed
        const lastInteraction = contactInteractions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

        if (lastInteraction) {
          const daysSinceLastInteraction = Math.floor(
            (new Date().getTime() - new Date(lastInteraction.timestamp).getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceLastInteraction > 30) {
            items.push({
              id: `followup-${contact.id}`,
              type: 'follow-up',
              title: `Follow up with ${contact.name}`,
              description: `No interaction in ${daysSinceLastInteraction} days`,
              priority: 'high',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              contactId: contact.id,
              contactName: contact.name,
              status: 'pending',
              completed: false
            });
          }
        }
      }

      // Sort by priority and due date
      items.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.dueDate.getTime() - b.dueDate.getTime();
      });

      setActionItems(items);
    } catch (err) {
      console.error('Failed to load action items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load action items');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: 'pending' | 'completed') => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('action_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;

      setActionItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Failed to update action item:', err);
    }
  };

  if (loading) return <div className="text-gray-500">Loading action items...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Prioritized Action Items</h2>
      {actionItems.length === 0 ? (
        <div className="text-gray-500">No action items at this time</div>
      ) : (
        <div className="space-y-3">
          {actionItems.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                item.priority === 'high'
                  ? 'border-red-500'
                  : item.priority === 'medium'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Contact: {item.contactName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    item.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : item.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                  <button
                    onClick={() => handleStatusChange(item.id, item.status === 'completed' ? 'pending' : 'completed')}
                    className={`px-2 py-1 rounded text-sm ${
                      item.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status === 'completed' ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Due: {item.dueDate.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 