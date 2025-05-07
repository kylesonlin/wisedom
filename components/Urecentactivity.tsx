'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from '@/components/ui/Ucard';
import { Button } from '@/components/ui/Ubutton';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'task_created' | 'task_completed' | 'contact_added' | 'contact_updated' | 'project_created' | 'project_updated' | 'meeting_scheduled' | 'note_added';
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

const activityIcons: Record<Activity['type'], string> = {
  task_created: '📝',
  task_completed: '✅',
  contact_added: '👤',
  contact_updated: '📋',
  project_created: '📊',
  project_updated: '🔄',
  meeting_scheduled: '📅',
  note_added: '📝',
};

const activityColors: Record<Activity['type'], string> = {
  task_created: 'bg-blue-100 text-blue-800',
  task_completed: 'bg-green-100 text-green-800',
  contact_added: 'bg-purple-100 text-purple-800',
  contact_updated: 'bg-yellow-100 text-yellow-800',
  project_created: 'bg-indigo-100 text-indigo-800',
  project_updated: 'bg-pink-100 text-pink-800',
  meeting_scheduled: 'bg-orange-100 text-orange-800',
  note_added: 'bg-gray-100 text-gray-800',
};

export default function RecentActivity() {
  const theme = useTheme();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');

  useEffect(() => {
    if (user) {
      loadActivities();
      subscribeToActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('activities')
        .select('*')
        .eq('userId', user?.id)
        .order('createdAt', { ascending: false })
        .limit(20);

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    const subscription = supabase
      .channel('activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `userId=eq.${user?.id}`,
        },
        (payload) => {
          setActivities((current) => [payload.new as Activity, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'task_created':
        return `Created task "${activity.title}"`;
      case 'task_completed':
        return `Completed task "${activity.title}"`;
      case 'contact_added':
        return `Added contact "${activity.title}"`;
      case 'contact_updated':
        return `Updated contact "${activity.title}"`;
      case 'project_created':
        return `Created project "${activity.title}"`;
      case 'project_updated':
        return `Updated project "${activity.title}"`;
      case 'meeting_scheduled':
        return `Scheduled meeting "${activity.title}"`;
      case 'note_added':
        return `Added note "${activity.title}"`;
      default:
        return activity.title;
    }
  };

  if (!user) {
    return (
      <Card className="p-4">
        <div className="text-gray-500">Please sign in to view activities</div>
      </Card>
    );
  }

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
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'task_created' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('task_created')}
          >
            Tasks
          </Button>
          <Button
            variant={filter === 'contact_added' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('contact_added')}
          >
            Contacts
          </Button>
          <Button
            variant={filter === 'project_created' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('project_created')}
          >
            Projects
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activityColors[activity.type]}`}
            >
              {activityIcons[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {getActivityMessage(activity)}
              </p>
              {activity.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No activities found
          </div>
        )}
      </div>
    </Card>
  );
} 