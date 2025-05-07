import React from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="checkbox"
              className={cn(
                'peer h-4 w-4 appearance-none rounded border border-input bg-background transition-colors checked:border-primary checked:bg-primary',
                error && 'border-destructive',
                className
              )}
              ref={ref}
              {...props}
            />
            <Check
              className={cn(
                'absolute left-0 top-0 h-4 w-4 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100'
              )}
            />
          </div>
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

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 