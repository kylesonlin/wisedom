import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { WidgetPreference } from '../types/contact';

interface Widget {
  id: string;
  title: string;
  component: React.ComponentType;
  enabled: boolean;
  order: number;
}

interface UseWidgetsReturn {
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  toggleWidget: (widgetId: string, enabled: boolean) => Promise<void>;
  reorderWidget: (widgetId: string, newOrder: number) => Promise<void>;
  updateWidgetSettings: (widgetId: string, settings: Record<string, any>) => Promise<void>;
}

const CACHE_KEY = 'widget_preferences_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useWidgets(userId: string): UseWidgetsReturn {
  const supabase = useSupabaseClient();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setWidgets(data);
          setLoading(false);
          return;
        }
      }

      const { data, error: fetchError } = await supabase
        .from('widgetPreferences')
        .select('*')
        .eq('userId', userId)
        .order('order', { ascending: true });

      if (fetchError) throw fetchError;

      // Initialize with default preferences if none exist
      if (!data || data.length === 0) {
        const defaultPreferences = [
          { id: 'networkuoverview', enabled: true, order: 0 },
          { id: 'contactucard', enabled: true, order: 1 },
          { id: 'relationshipustrength', enabled: true, order: 2 },
          { id: 'actionuitems', enabled: true, order: 3 },
          { id: 'aiusuggestions', enabled: true, order: 4 },
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
          component: () => null,
        }));

        setWidgets(formattedWidgets);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: formattedWidgets,
          timestamp: Date.now(),
        }));
      } else {
        const formattedWidgets = data.map((pref) => ({
          ...pref,
          title: pref.widgetId
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          component: () => null,
        }));

        setWidgets(formattedWidgets);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: formattedWidgets,
          timestamp: Date.now(),
        }));
      }
    } catch (err) {
      console.error('Error loading widget preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load widget preferences');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

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
        .eq('widgetId', widgetId);

      if (error) throw error;

      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, enabled } : widget
        )
      );

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const updatedData = data.map((widget: Widget) =>
          widget.id === widgetId ? { ...widget, enabled } : widget
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: updatedData,
          timestamp,
        }));
      }
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
        .eq('widgetId', widgetId);

      if (error) throw error;

      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, order: newOrder } : widget
        )
      );

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const updatedData = data.map((widget: Widget) =>
          widget.id === widgetId ? { ...widget, order: newOrder } : widget
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: updatedData,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error reordering widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder widget');
    }
  };

  const updateWidgetSettings = async (widgetId: string, settings: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('widgetPreferences')
        .update({ settings })
        .eq('userId', userId)
        .eq('widgetId', widgetId);

      if (error) throw error;

      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, settings } : widget
        )
      );

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const updatedData = data.map((widget: Widget) =>
          widget.id === widgetId ? { ...widget, settings } : widget
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: updatedData,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error updating widget settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update widget settings');
    }
  };

  return {
    widgets,
    loading,
    error,
    toggleWidget,
    reorderWidget,
    updateWidgetSettings,
  };
} 