'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Ucard';
import { Button } from '../ui/Ubutton';
import { useTheme } from '../Uthemeprovider';
import { useWidgets } from '../../hooks/useWidgets';
import { useUser } from '@supabase/auth-helpers-react';
import NetworkOverview from '../Unetworkoverview';
import ContactCard from '../Ucontactcard';
import RelationshipStrength from '../Urelationshipstrength';
import ActionItems from '../Uactionitems';
import AIActionSuggestions from '../Uaiactionsuggestions';

interface Widget {
  id: string;
  title: string;
  component: React.ElementType;
  enabled: boolean;
  order: number;
}

const defaultWidgets: Widget[] = [
  {
    id: 'network-overview',
    title: 'Network Overview',
    component: NetworkOverview,
    enabled: true,
    order: 0,
  },
  {
    id: 'contact-card',
    title: 'Contact Card',
    component: () => <ContactCard id="demo" name="Demo User" email="demo@example.com" />,
    enabled: true,
    order: 1,
  },
  {
    id: 'relationship-strength',
    title: 'Relationship Strength',
    component: () => <RelationshipStrength />,
    enabled: true,
    order: 2,
  },
  {
    id: 'action-items',
    title: 'Action Items',
    component: () => <ActionItems />,
    enabled: true,
    order: 3,
  },
  {
    id: 'ai-suggestions',
    title: 'AI Suggestions',
    component: AIActionSuggestions,
    enabled: true,
    order: 4,
  },
];

interface DashboardLayoutProps {
  className?: string;
  widgets?: Widget[];
  onWidgetToggle?: (id: string, enabled: boolean) => void;
  onWidgetReorder?: (id: string, newOrder: number) => void;
}

export default function DashboardLayout({ className = '', widgets: widgetsProp, onWidgetToggle, onWidgetReorder }: DashboardLayoutProps) {
  const theme = useTheme();
  const user = useUser();
  const { widgets: widgetsState, loading, error, toggleWidget, reorderWidget } = useWidgets(user?.id || '');
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>(defaultWidgets);
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Use widgets from props if provided, otherwise from state
  const widgets = widgetsProp || widgetsState;

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData('widgetId', widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetOrder: number) => {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData('widgetId');
    reorderWidget(widgetId, targetOrder);
  };

  const handleDragEnd = () => {
    // Clean up any drag-related state if needed
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
      <div className="animate-pulse space-y-4">
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
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button
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
        <Card className="p-4">
          <h3 className="font-medium mb-2">Available Widgets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {disabledWidgets.map((widget) => (
              <Button
                key={widget.id}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enabledWidgets.map((widget, index) => (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className="relative group"
          >
            <Card className="p-4 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{widget.title}</h3>
                <Button
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
              <widget.component />
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
} 