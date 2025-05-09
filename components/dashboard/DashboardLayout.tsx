import React from 'react';
import { useDashboardStore } from '@/store/dashboard';
import { Widget } from './Widget';
import { Button } from '@/components/ui/Button';
import { Grid, Layout } from 'lucide-react';
import { cn } from '@/utils/cn';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DashboardLayoutProps {
  className?: string;
  children?: React.ReactNode;
}

export function DashboardLayout({ className, children }: DashboardLayoutProps) {
  const { widgets, layout, updateLayout, removeWidget } = useDashboardStore();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn('space-y-4', className)}>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateLayout(layout === 'grid' ? 'free' : 'grid')}
          >
            {layout === 'grid' ? (
              <>
                <Layout className="w-4 h-4 mr-2" />
                Switch to Free Layout
              </>
            ) : (
              <>
                <Grid className="w-4 h-4 mr-2" />
                Switch to Grid Layout
              </>
            )}
          </Button>
        </div>

        <div
          className={cn(
            'grid gap-4',
            layout === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {widgets.map((widget) => (
            <Widget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              type={widget.type}
              onRemove={() => removeWidget(widget.id)}
              className={cn(
                layout === 'free' && 'absolute',
                layout === 'free' && {
                  left: widget.position.x,
                  top: widget.position.y,
                  width: widget.size.width,
                  height: widget.size.height,
                }
              )}
            >
              {/* Widget content will be rendered here */}
              <div>Widget Content</div>
            </Widget>
          ))}
        </div>
        {children}
      </div>
    </DndProvider>
  );
} 