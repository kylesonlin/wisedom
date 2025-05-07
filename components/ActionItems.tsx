'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  contactId: string;
  contactName: string;
  type: 'follow_up' | 'introduction' | 'check_in' | 'other';
  createdAt: string;
  metadata?: {
    notes?: string;
    reminderSent?: boolean;
    completedAt?: string | null;
  };
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const typeColors = {
  follow_up: 'bg-purple-100 text-purple-800',
  introduction: 'bg-indigo-100 text-indigo-800',
  check_in: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function ActionItems() {
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  useEffect(() => {
    if (user) {
      loadActionItems();
    }
  }, [user]);

  const loadActionItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          contacts:contactId (
            name
          )
        `)
        .eq('userId', user?.id)
        .eq('type', 'action_item')
        .order('dueDate', { ascending: true });

      if (error) throw error;

      const formattedItems = data.map((item: any) => ({
        ...item,
        contactName: item.contacts?.name || 'Unknown Contact',
      }));

      setActionItems(formattedItems);
    } catch (err) {
      console.error('Error loading action items:', err);
      setError('Failed to load action items');
    } finally {
      setLoading(false);
    }
  };

  const updateActionItemStatus = async (itemId: string, newStatus: ActionItem['status']) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          status: newStatus,
          metadata: {
            ...actionItems.find(item => item.id === itemId)?.metadata,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          },
        })
        .eq('id', itemId);

      if (error) throw error;

      setActionItems(items =>
        items.map(item =>
          item.id === itemId
            ? {
                ...item,
                status: newStatus,
                metadata: {
                  ...item.metadata,
                  completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
                },
              }
            : item
        )
      );
    } catch (err) {
      console.error('Error updating action item:', err);
      setError('Failed to update action item');
    }
  };

  const filteredItems = actionItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contactName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      const matchesPriority = !selectedPriority || item.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const getPriorityWeight = (priority: ActionItem['priority']): number => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

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
          <h2 className="text-lg font-semibold">Action Items</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStatus(null)}
              className={!selectedStatus ? 'bg-gray-100' : ''}
            >
              All Status
            </Button>
            {Object.keys(statusColors).map(status => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className={selectedStatus === status ? 'bg-gray-100' : ''}
              >
                {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <select
            value={selectedPriority || ''}
            onChange={(e) => setSelectedPriority(e.target.value || null)}
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created At</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No action items found
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[item.priority]}`}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                      {item.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateActionItemStatus(item.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    {item.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateActionItemStatus(item.id, 'in_progress')}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>For: {item.contactName}</span>
                  <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                </div>
                {item.metadata?.notes && (
                  <div className="text-sm text-gray-600 mt-2">
                    <strong>Notes:</strong> {item.metadata.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
} 