import { useState, useEffect } from 'react';

interface Widget {
  id: string;
  enabled: boolean;
  order: number;
}

interface UseWidgetsReturn {
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  toggleWidget: (id: string, enabled: boolean) => void;
  reorderWidget: (id: string, newOrder: number) => void;
}

export function useWidgets(userId: string): UseWidgetsReturn {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWidgets();
  }, [userId]);

  const fetchWidgets = async () => {
    try {
      const response = await fetch('/api/widget-preferences');
      const data = await response.json();
      setWidgets(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load widgets');
      setLoading(false);
    }
  };

  const toggleWidget = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/widget-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update widget preferences');
      }

      setWidgets((prevWidgets) =>
        prevWidgets.map((widget) =>
          widget.id === id ? { ...widget, enabled } : widget
        )
      );
    } catch (err) {
      setError('Failed to update widget preferences');
    }
  };

  const reorderWidget = async (id: string, newOrder: number) => {
    try {
      const response = await fetch('/api/widget-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, order: newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to update widget order');
      }

      setWidgets((prevWidgets) =>
        prevWidgets.map((widget) =>
          widget.id === id ? { ...widget, order: newOrder } : widget
        )
      );
    } catch (err) {
      setError('Failed to update widget order');
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