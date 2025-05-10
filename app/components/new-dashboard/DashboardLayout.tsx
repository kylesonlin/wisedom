'use client';

import * as React from 'react';
import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWidgets } from '@/hooks/useWidgets';
import { useUser } from '@supabase/auth-helpers-react';
import NetworkOverview from '@/components/NetworkOverview';
import ContactCard from '@/components/ContactCard';
import RelationshipStrength from '@/components/RelationshipStrength';
import ActionItems from '@/components/ActionItems';
import AIActionSuggestions from '@/components/AIActionSuggestions';
import { PlusIcon, RefreshCwIcon, CogIcon, XIcon } from 'lucide-react';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/utils/storage';

// Base widget props interface
interface BaseWidgetProps {
  id: string;
  settings?: WidgetSettings;
}

// Widget settings interface
interface WidgetSettings {
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  refreshInterval?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  customStyles?: Record<string, string>;
  [key: string]: unknown;
}

// Specific widget props interfaces
interface ContactCardProps extends BaseWidgetProps {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  company?: string;
  lastContact?: Date;
}

interface AIActionSuggestionsProps extends BaseWidgetProps {
  suggestions: Array<{
    id: string;
    contactId: string;
    contactName: string;
    type: 'email' | 'call' | 'meeting' | 'followuup';
    priority: 'high' | 'medium' | 'low';
    reason: string;
    suggestedAction: string;
    suggestedTime: Date;
    confidence?: number;
    notes?: string;
  }>;
  onActionSelect: (suggestion: AIActionSuggestionsProps['suggestions'][0]) => void;
}

interface NetworkOverviewProps extends BaseWidgetProps {
  connections: number;
  activeContacts: number;
  pendingRequests: number;
  recentActivity: Array<{
    id: string;
    type: 'connection' | 'message' | 'meeting';
    timestamp: Date;
    description: string;
  }>;
}

interface RelationshipStrengthProps extends BaseWidgetProps {
  metrics: Array<{
    contactId: string;
    name: string;
    score: number;
    lastInteraction: Date;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
}

interface ActionItemsProps extends BaseWidgetProps {
  items: Array<{
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
    completed: boolean;
    assignedTo?: string;
    category: 'follow-up' | 'meeting' | 'task' | 'other';
  }>;
}

// Widget component type with proper type casting
type WidgetComponent = React.ComponentType<BaseWidgetProps>;

// Helper function to cast widget components with improved type safety
const castWidgetComponent = <T extends BaseWidgetProps>(
  component: React.ComponentType<T>
): WidgetComponent => {
  return component as unknown as WidgetComponent;
};

// Wrapper component for AIActionSuggestions
const AIActionSuggestionsWrapper: WidgetComponent = (props) => {
  const { settings } = props;
  const suggestions = settings?.suggestions as AIActionSuggestionsProps['suggestions'] || [];
  const onActionSelect = settings?.onActionSelect as AIActionSuggestionsProps['onActionSelect'] || (() => {});
  
  return (
    <AIActionSuggestions
      suggestions={suggestions}
      onActionSelect={onActionSelect}
    />
  );
};

interface Widget {
  id: string;
  title: string;
  component: WidgetComponent;
  enabled: boolean;
  order: number;
  settings?: WidgetSettings;
  type: 'contact-card' | 'network-overview' | 'relationship-strength' | 'action-items' | 'ai-suggestions';
  description?: string;
  category?: 'analytics' | 'contacts' | 'tasks' | 'ai' | 'other';
  permissions?: Array<'read' | 'write' | 'delete'>;
}

interface DashboardLayoutProps {
  className?: string;
  widgets?: Widget[];
  onWidgetToggle?: (id: string, enabled: boolean) => void;
  onWidgetReorder?: (id: string, newOrder: number) => void;
  onSavePreferences?: (preferences: Record<string, boolean>) => void;
  initialPreferences?: Record<string, boolean>;
  layout?: 'grid' | 'list';
  maxColumns?: 1 | 2 | 3 | 4;
  spacing?: 'compact' | 'normal' | 'wide';
  allowReordering?: boolean;
  allowCustomization?: boolean;
}

// Move these outside the component to avoid recreation
const WIDGET_CACHE_KEY = 'dashboard_widgets_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create a custom hook for cache management
const useWidgetCache = () => {
  const getCachedWidgets = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = getLocalStorage(WIDGET_CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        removeLocalStorage(WIDGET_CACHE_KEY);
        return null;
      }
      
      return data as Widget[];
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }, []);

  const setCachedWidgets = useCallback((data: Widget[]) => {
    if (typeof window === 'undefined') return;
    try {
      setLocalStorage(WIDGET_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }, []);

  return { getCachedWidgets, setCachedWidgets };
};

// Error boundary fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-4 border border-red-500 rounded-lg bg-red-50">
    <h3 className="text-red-700 font-semibold">Widget Error</h3>
    <p className="text-red-600">{error.message}</p>
    <Button
      variant="outline"
      onClick={resetErrorBoundary}
      className="mt-2"
    >
      Try again
    </Button>
  </div>
);

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
    type: 'network-overview',
    category: 'analytics',
    permissions: ['read'],
  },
  {
    id: 'contact-card',
    title: 'Contact Card',
    component: castWidgetComponent(ContactCard),
    enabled: true,
    order: 1,
    type: 'contact-card',
    category: 'contacts',
    permissions: ['read', 'write'],
    settings: {
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'Software Engineer',
      company: 'Tech Corp',
    },
  },
  {
    id: 'relationship-strength',
    title: 'Relationship Strength',
    component: castWidgetComponent(RelationshipStrength),
    enabled: true,
    order: 2,
    type: 'relationship-strength',
    category: 'analytics',
    permissions: ['read'],
  },
  {
    id: 'action-items',
    title: 'Action Items',
    component: castWidgetComponent(ActionItems),
    enabled: true,
    order: 3,
    type: 'action-items',
    category: 'tasks',
    permissions: ['read', 'write', 'delete'],
  },
  {
    id: 'ai-suggestions',
    title: 'AI Suggestions',
    component: AIActionSuggestionsWrapper,
    enabled: true,
    order: 4,
    type: 'ai-suggestions',
    category: 'ai',
    permissions: ['read'],
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
  const { getCachedWidgets, setCachedWidgets } = useWidgetCache();

  // Use widgets from props if provided, otherwise from state
  const widgets = useMemo(() => {
    const mergedWidgets = widgetsProp || widgetsState;
    if (!Array.isArray(mergedWidgets)) {
      console.error('Invalid widgets data received');
      return defaultWidgets;
    }
    return mergedWidgets as Widget[];
  }, [widgetsProp, widgetsState]);

  // Fix the cache management effect
  useEffect(() => {
    const cached = getCachedWidgets();
    if (cached) {
      setAvailableWidgets(cached);
      return;
    }

    const updatedWidgets = defaultWidgets.map(widget => ({
      ...widget,
      enabled: widgets.some(w => w.id === widget.id && w.enabled)
    }));
    
    setAvailableWidgets(updatedWidgets);
    setCachedWidgets(updatedWidgets);
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

  // Fix the widget handlers
  const handleAddWidget = useCallback((widgetId: string) => {
    try {
      const widget = defaultWidgets.find((w) => w.id === widgetId);
      if (widget) {
        toggleWidget(widgetId, true);
        setShowAddWidget(false);
      }
    } catch (error) {
      console.error('Error adding widget:', error);
    }
  }, [toggleWidget]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    try {
      toggleWidget(widgetId, false);
    } catch (error) {
      console.error('Error removing widget:', error);
    }
  }, [toggleWidget]);

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
    <div className="space-y-4" data-testid="dashboard-layout">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" data-testid="dashboard-title">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            data-testid="add-widget-button"
            className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex items-center space-x-2"
            onClick={() => setShowAddWidget(!showAddWidget)}
          >
            <span>Add Widget</span>
            <PlusIcon className="h-5 w-5" />
          </button>
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
                  <button
                    data-testid={`widget-refresh-${widget.id}`}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      // Force widget refresh by updating its key
                      setAvailableWidgets(prev => [...prev]);
                    }}
                  >
                    <RefreshCwIcon className="h-5 w-5" />
                  </button>
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
                <ErrorBoundary
                  FallbackComponent={ErrorFallback}
                  onError={(error) => {
                    console.error(`Widget ${widget.id} failed:`, error);
                    // You might want to report this error to your error tracking service
                  }}
                >
                  <widget.component 
                    id={widget.id} 
                    settings={widget.settings} 
                  />
                </ErrorBoundary>
              </Suspense>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
} 