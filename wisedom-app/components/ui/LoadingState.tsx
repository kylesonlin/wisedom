import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'default' | 'overlay' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingState({
  variant = 'default',
  size = 'md',
  text,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variants = {
    default: 'flex items-center justify-center p-4',
    overlay: 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center',
    inline: 'inline-flex items-center gap-2',
  };

  return (
    <div className={cn(variants[variant], className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="ml-2 text-sm">{text}</span>}
    </div>
  );
} 