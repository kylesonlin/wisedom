'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWidgets } from '@/hooks/useWidgets';
import { useUser } from '@supabase/auth-helpers-react';
import NetworkOverview from '@/components/NetworkOverview';
import ContactCard from '@/components/ContactCard';
import RelationshipStrength from '@/components/RelationshipStrength';
import ActionItems from '@/components/ActionItems';
import AIActionSuggestions from '@/components/AIActionSuggestions';

// Base widget props interface
interface BaseWidgetProps {
  id: string;
  settings?: Record<string, any>;
}

// Specific widget props interfaces
interface ContactCardProps extends BaseWidgetProps {
  name?: string;
  email?: string;
}

interface AIActionSuggestionsProps {
  suggestions?: any[];
  onActionSelect?: (action: any) => void;
}

// Widget component type with proper type casting
type WidgetComponent = React.ComponentType<BaseWidgetProps>;

// Helper function to cast widget components
const castWidgetComponent = <T extends BaseWidgetProps>(
  component: React.ComponentType<T>
): WidgetComponent => {
  return component as unknown as WidgetComponent;
};

// Wrapper component for AIActionSuggestions
const AIActionSuggestionsWrapper: WidgetComponent = (props) => {
  const { settings } = props;
  return (
    <AIActionSuggestions
      suggestions={settings?.suggestions}
      onActionSelect={settings?.onActionSelect}
    />
  );
};

interface Widget {
  id: string;
  title: string;
  component: WidgetComponent;
  enabled: boolean;
  order: number;
  settings?: Record<string, any>;
}

interface DashboardLayoutProps {
  className?: string;
  widgets?: Widget[];
  onWidgetToggle?: (id: string, enabled: boolean) => void;
  onWidgetReorder?: (id: string, newOrder: number) => void;
  onSavePreferences?: (preferences: Record<string, boolean>) => void;
  initialPreferences?: Record<string, boolean>;
}

// Cache key and duration
const WIDGET_CACHE_KEY = 'dashboard_widgets_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Error boundary component for widgets
class WidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; widgetId: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; widgetId: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-4">
          <div className="text-red-500 mb-2">Widget Error: {this.state.error?.message}</div>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry Widget
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Loading component for widgets
const WidgetLoading = () => (
  <Card className="p-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </Card>
);

const defaultWidgets: Widget[] = [
  {
    id: 'network-overview',
    title: 'Network Overview',
    component: castWidgetComponent(NetworkOverview),
    enabled: true,
    order: 0,
  },
  {
    id: 'contact-card',
    title: 'Contact Card',
    component: castWidgetComponent(ContactCard),
    enabled: true,
    order: 1,
    settings: {
      name: 'Demo User',
      email: 'demo@example.com',
    },
  },
  {
    id: 'relationship-strength',
    title: 'Relationship Strength',
    component: castWidgetComponent(RelationshipStrength),
    enabled: true,
    order: 2,
  },
  {
    id: 'action-items',
    title: 'Action Items',
    component: castWidgetComponent(ActionItems),
    enabled: true,
    order: 3,
  },
  {
    id: 'ai-suggestions',
    title: 'AI Suggestions',
    component: AIActionSuggestionsWrapper,
    enabled: true,
    order: 4,
  },
];

export default function DashboardLayout({ 
  className = '', 
  widgets: widgetsProp, 
  onWidgetToggle, 
  onWidgetReorder,
  onSavePreferences,
  initialPreferences,
}: DashboardLayoutProps) {
  const user = useUser();
  const { widgets: widgetsState, loading, error, toggleWidget, reorderWidget } = useWidgets(user?.id || '');
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>(defaultWidgets);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Use widgets from props if provided, otherwise from state
  const widgets = (widgetsProp || widgetsState) as Widget[];

  // Cache management
  const getCachedWidgets = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(WIDGET_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(WIDGET_CACHE_KEY);
      return null;
    }
    
    return data as Widget[];
  }, []);

  const setCachedWidgets = useCallback((data: Widget[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(WIDGET_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }, []);

  // Sync available widgets with enabled/disabled state
  useEffect(() => {
    const cached = getCachedWidgets();
    if (cached) {
      setAvailableWidgets(cached);
      return;
    }

    setAvailableWidgets(prevWidgets => 
      prevWidgets.map(widget => ({
        ...widget,
        enabled: widgets.some(w => w.id === widget.id && w.enabled)
      }))
    );
    setCachedWidgets(widgets);
  }, [widgets, getCachedWidgets, setCachedWidgets]);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setIsReordering(true);
    e.dataTransfer.setData('widgetId', widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetOrder: number) => {
    e.preventDefault();
    setIsReordering(false);
    const widgetId = e.dataTransfer.getData('widgetId');
    
    // Find the current order of the dragged widget
    const draggedWidget = widgets.find(w => w.id === widgetId);
    if (!draggedWidget) return;
    
    // Calculate new order for all affected widgets
    const updatedWidgets = widgets.map(widget => {
      if (widget.id === widgetId) {
        return { ...widget, order: targetOrder };
      }
      if (widget.order >= targetOrder && widget.order < draggedWidget.order) {
        return { ...widget, order: widget.order + 1 };
      }
      if (widget.order <= targetOrder && widget.order > draggedWidget.order) {
        return { ...widget, order: widget.order - 1 };
      }
      return widget;
    });

    // Call reorderWidget for each affected widget
    updatedWidgets.forEach(widget => {
      if (widget.order !== widgets.find(w => w.id === widget.id)?.order) {
        reorderWidget(widget.id, widget.order);
      }
    });

    // Update cache
    setCachedWidgets(updatedWidgets);
  };

  const handleDragEnd = () => {
    setIsReordering(false);
    document.body.style.cursor = 'default';
  };

  const handleAddWidget = (widgetId: string) => {
    const widget = availableWidgets.find((w) => w.id === widgetId);
    if (widget) {
      toggleWidget(widgetId, true);
      setShowAddWidget(false);
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    toggleWidget(widgetId, false);
  };

  const enabledWidgets = widgets.filter((w: Widget) => w.enabled);
  const disabledWidgets = availableWidgets.filter((w: Widget) => !w.enabled);

  if (loading) {
    return (
      <div data-testid="loading-skeleton" className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div data-testid="error-message" className="text-red-500 mb-4">Error: {error}</div>
        <Button
          data-testid="retry-button"
          onClick={() => {
            // Force a re-render by updating the key
            setAvailableWidgets(prev => [...prev]);
          }}
          variant="outline"
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div data-testid="dashboard-layout" className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 data-testid="dashboard-title" className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button
            data-testid="add-widget-button"
            variant="outline"
            onClick={() => setShowAddWidget(!showAddWidget)}
            className="flex items-center space-x-2"
          >
            <span>Add Widget</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      </div>

      {showAddWidget && (
        <Card data-testid="available-widgets" className="p-4">
          <h3 className="font-medium mb-2">Available Widgets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {disabledWidgets.map((widget) => (
              <Button
                key={widget.id}
                data-testid={`widget-button-${widget.id}`}
                variant="outline"
                onClick={() => handleAddWidget(widget.id)}
                className="flex items-center justify-center p-2"
              >
                {widget.title}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div 
        data-testid="widget-grid" 
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isReordering ? 'cursor-grabbing' : ''}`}
      >
        {enabledWidgets.map((widget: Widget, index: number) => (
          <div
            key={widget.id}
            data-testid={`widget-${widget.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative group ${isReordering ? 'cursor-grabbing' : ''}`}
          >
            <Card className="p-4 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{widget.title}</h3>
                <div className="flex space-x-2">
                  <Button
                    data-testid={`widget-refresh-${widget.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Force widget refresh by updating its key
                      setAvailableWidgets(prev => [...prev]);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                  <Button
                    data-testid={`widget-settings-${widget.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                  <Button
                    data-testid={`widget-toggle-${widget.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWidget(widget.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
              <Suspense fallback={<WidgetLoading />}>
                <WidgetErrorBoundary widgetId={widget.id}>
                  <widget.component id={widget.id} settings={widget.settings} />
                </WidgetErrorBoundary>
              </Suspense>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
} 