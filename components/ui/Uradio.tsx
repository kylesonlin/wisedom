import React from 'react';
import { cn } from '../../utils/cn';

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            className={cn(
              'h-4 w-4 appearance-none rounded-full border border-input bg-background transition-colors checked:border-primary checked:bg-primary',
              error && 'border-destructive',
              className
            )}
            ref={ref}
            {...props}
          />
          {label && <span className="text-sm font-medium">{label}</span>}
        </label>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio }; 