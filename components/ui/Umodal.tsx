import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';
import { Button } from './Ubutton';
import { Card } from './Ucard';
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
} as const;

const variantColors = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  default: '',
} as const;

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const;

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
  const Icon = variantIcons[variant];
  const variantColor = variantColors[variant];

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 transition-opacity',
            preventCloseOnBackdrop && 'pointer-events-none'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            sizeClasses[size]
          )}
        >
          <Card className={cn('relative w-full overflow-hidden rounded-lg shadow-lg', className)}>
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center space-x-2">
                {Icon && <Icon className={cn('h-5 w-5', variantColor)} />}
                <DialogPrimitive.Title className="text-lg font-semibold">
                  {title}
                </DialogPrimitive.Title>
              </div>
              {showCloseButton && (
                <DialogPrimitive.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogPrimitive.Close>
              )}
            </div>
            <DialogPrimitive.Description className="p-4">
              {children}
            </DialogPrimitive.Description>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t p-4">
                {footer}
              </div>
            )}
          </Card>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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