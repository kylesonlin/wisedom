import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Card } from './Card';
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';

export type ModalVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: ModalVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  preventCloseOnBackdrop?: boolean;
}

const variantIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  default: undefined,
};

const variantColors = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  default: '',
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  variant = 'default',
  size = 'md',
  showCloseButton = true,
  preventCloseOnBackdrop = false,
}: ModalProps) {
  if (!isOpen) return null;

  const Icon = variantIcons[variant];
  const variantColor = variantColors[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={preventCloseOnBackdrop ? undefined : onClose}
      />
      <Card
        className={cn(
          'relative z-50 w-full overflow-hidden rounded-lg shadow-lg',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className={cn('h-5 w-5', variantColor)} />}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t p-4">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalContent({ children, className }: ModalContentProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  );
} 