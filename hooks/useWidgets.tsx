"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Widget, WidgetComponent, BaseWidgetProps } from '@/types/widget';
import NetworkOverview from '@/components/NetworkOverview';
import ContactCard from '@/components/ContactCard';
import RelationshipStrength from '@/components/RelationshipStrength';
import ActionItems from '@/components/ActionItems';
import AIActionSuggestions from '@/components/AIActionSuggestions';

const CACHE_KEY = 'widgets-cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface UseWidgetsReturn {
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  toggleWidget: (widgetId: string, enabled: boolean) => Promise<void>;
  reorderWidget: (widgetId: string, newOrder: number) => Promise<void>;
}

// Wrapper components that accept BaseWidgetProps
const NetworkOverviewWrapper: WidgetComponent = () => {
  return <NetworkOverview />;
};

const ContactCardWrapper: WidgetComponent = (props) => {
  const contactProps = {
    id: props.id,
    name: "Demo User",
    email: "demo@example.com",
    company: "Demo Company",
    role: "Software Engineer",
    lastContact: "2024-03-20",
    nextFollowUp: "2024-03-27",
    tags: ["client", "tech"],
    priority: "medium" as const,
  };
  return <ContactCard {...contactProps} />;
};

const RelationshipStrengthWrapper: WidgetComponent = () => {
  return <RelationshipStrength />;
};

const ActionItemsWrapper: WidgetComponent = () => {
  return <ActionItems />;
};

const AIActionSuggestionsWrapper: WidgetComponent = () => {
  return <AIActionSuggestions suggestions={[]} onActionSelect={() => {}} />;
};

const widgetComponents = {
  'network-overview': NetworkOverviewWrapper,
  'contact-card': ContactCardWrapper,
  'relationship-strength': RelationshipStrengthWrapper,
  'action-items': ActionItemsWrapper,
  'ai-suggestions': AIActionSuggestionsWrapper,
};

export function useWidgets(userId: string): UseWidgetsReturn {
  const supabase = useSupabaseClient();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  }, []);

  const setCachedData = useCallback((data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }, []);

  const loadWidgets = useCallback(async () => {
    try {
      setLoading(true);

      // Check cache first
      const cached = getCachedData();
      if (cached) {
        setWidgets(cached.map((widget: Widget) => ({
          ...widget,
          component: widgetComponents[widget.id as keyof typeof widgetComponents] || (() => null),
        })));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('widgetPreferences')
        .select('*')
        .eq('userId', userId)
        .order('order', { ascending: true });

      if (error) throw error;

      // Initialize with default preferences if none exist
      if (!data || data.length === 0) {
        const defaultPreferences = [
          { id: 'network-overview', enabled: true, order: 0, type: 'network-overview' as const, category: 'analytics' as const },
          { id: 'contact-card', enabled: true, order: 1, type: 'contact-card' as const, category: 'contacts' as const },
          { id: 'relationship-strength', enabled: true, order: 2, type: 'relationship-strength' as const, category: 'analytics' as const },
          { id: 'action-items', enabled: true, order: 3, type: 'action-items' as const, category: 'tasks' as const },
          { id: 'ai-suggestions', enabled: true, order: 4, type: 'ai-suggestions' as const, category: 'ai' as const },
        ];

        const { error: insertError } = await supabase
          .from('widgetPreferences')
          .insert(
            defaultPreferences.map((pref) => ({
              ...pref,
              userId,
              settings: {},
            }))
          );

        if (insertError) throw insertError;

        const formattedWidgets = defaultPreferences.map((pref) => ({
          ...pref,
          title: pref.id
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          component: widgetComponents[pref.id as keyof typeof widgetComponents] || (() => null),
        }));

        setWidgets(formattedWidgets);
        setCachedData(formattedWidgets);
      } else {
        const formattedWidgets = data.map((pref) => ({
          ...pref,
          title: pref.id
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          component: widgetComponents[pref.id as keyof typeof widgetComponents] || (() => null),
        }));

        setWidgets(formattedWidgets);
        setCachedData(formattedWidgets);
      }
    } catch (err) {
      console.error('Error loading widget preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load widget preferences');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, getCachedData, setCachedData]);

  useEffect(() => {
    if (userId) {
      loadWidgets();
    }
  }, [userId, loadWidgets]);

  const toggleWidget = async (widgetId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('widgetPreferences')
        .update({ enabled })
        .eq('userId', userId)
        .eq('id', widgetId);

      if (error) throw error;

      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, enabled } : widget
        )
      );

      // Update cache
      setCachedData(
        widgets.map((widget) =>
          widget.id === widgetId ? { ...widget, enabled } : widget
        )
      );
    } catch (err) {
      console.error('Error toggling widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle widget');
    }
  };

  const reorderWidget = async (widgetId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('widgetPreferences')
        .update({ order: newOrder })
        .eq('userId', userId)
        .eq('id', widgetId);

      if (error) throw error;

      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, order: newOrder } : widget
        )
      );

      // Update cache
      setCachedData(
        widgets.map((widget) =>
          widget.id === widgetId ? { ...widget, order: newOrder } : widget
        )
      );
    } catch (err) {
      console.error('Error reordering widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder widget');
    }
  };

  return {
    widgets,
    loading,
    error,
    toggleWidget,
    reorderWidget,
  };
} 