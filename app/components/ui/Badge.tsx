import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  color = 'default',
  icon,
  className,
  'aria-label': ariaLabel,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-input bg-background',
  };

  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const colorStyles = {
    default: '',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        colorStyles[color],
        className
      )}
      aria-label={ariaLabel}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
} 