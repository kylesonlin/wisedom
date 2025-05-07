import React from 'react';
import { DatePicker } from '@/components/ui/Udatepicker';
import { cn } from '@/lib/utils';

interface FormDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  className?: string;
}

export function FormDatePicker({ label, value, onChange, error, className }: FormDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value ? value.toISOString().split('T')[0] : ''}
          readOnly
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full px-3 py-2 border rounded-md",
            error ? "border-destructive" : "border-input",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        />
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
          <DatePicker
            initialDate={value || new Date()}
            onSelect={(date: Date) => {
              onChange(date);
              setIsOpen(false);
            }}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
} 