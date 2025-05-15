import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GripVertical, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingState } from '@/components/ui/LoadingState';

interface WidgetProps {
  id: string;
  title: string;
  type: 'activity' | 'task' | 'contact' | 'project';
  children: React.ReactNode;
  isLoading?: boolean;
  error?: Error;
  onRemove?: () => void;
  className?: string;
}

export function Widget({
  id,
  title,
  type,
  children,
  isLoading,
  error,
  onRemove,
  className,
}: WidgetProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="p-4">
        <ErrorBoundary>
          {isLoading ? (
            <LoadingState variant="default" text="Loading..." />
          ) : error ? (
            <div className="text-destructive text-sm">{error.message}</div>
          ) : (
            children
          )}
        </ErrorBoundary>
      </div>
    </Card>
  );
} 