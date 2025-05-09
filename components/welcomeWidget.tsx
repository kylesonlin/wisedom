'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSupabaseClient, User } from '@supabase/auth-helpers-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UserStats {
  totalContacts: number;
  upcomingEvents: number;
  pendingTasks: number;
  recentInteractions: number;
  lastLogin: string;
  streak: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function WelcomeWidget() {
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total contacts
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user?.id);

      // Get upcoming events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user?.id)
        .gte('startDate', new Date().toISOString());

      // Get pending tasks
      const { count: tasksCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user?.id)
        .eq('type', 'action_item')
        .eq('status', 'pending');

      // Get recent interactions
      const { count: interactionsCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user?.id)
        .in('type', ['email', 'call', 'meeting', 'message'])
        .gte('createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get last login and streak
      const { data: profileData } = await supabase
        .from('profiles')
        .select('lastLogin, streak')
        .eq('id', user?.id)
        .single();

      setStats({
        totalContacts: contactsCount || 0,
        upcomingEvents: eventsCount || 0,
        pendingTasks: tasksCount || 0,
        recentInteractions: interactionsCount || 0,
        lastLogin: profileData?.lastLogin || new Date().toISOString(),
        streak: profileData?.streak || 0,
      });
    } catch (err) {
      console.error('Error loading user stats:', err);
      setError('Failed to load user stats');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-contact',
      title: 'Add Contact',
      description: 'Add a new contact to your network',
      icon: '👤',
      action: () => window.location.href = '/contacts/new',
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Schedule a meeting with your contacts',
      icon: '📅',
      action: () => window.location.href = '/meetings/new',
    },
    {
      id: 'create-task',
      title: 'Create Task',
      description: 'Create a new task or reminder',
      icon: '✓',
      action: () => window.location.href = '/tasks/new',
    },
    {
      id: 'view-events',
      title: 'View Events',
      description: 'Browse upcoming events',
      icon: '🎯',
      action: () => window.location.href = '/events',
    },
  ];

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
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {getGreeting()}, {user?.email?.split('@')[0] || 'there'}!
          </h2>
          <p className="text-gray-600">
            Welcome back to your networking dashboard. Here's what's happening today.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">{stats.totalContacts}</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-semibold text-purple-600">{stats.upcomingEvents}</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">{stats.pendingTasks}</div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-semibold text-orange-600">{stats.recentInteractions}</div>
              <div className="text-sm text-gray-600">Recent Interactions</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map(action => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex items-start space-x-4 text-left"
                onClick={action.action}
              >
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-gray-600">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {stats && stats.streak > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-medium">Login Streak</div>
                <div className="text-sm text-gray-600">
                  You've logged in for {stats.streak} days in a row!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 