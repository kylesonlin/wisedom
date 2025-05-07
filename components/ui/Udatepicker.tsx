import React from 'react';
import { Calendar } from '@/components/ui/Ucalendar';
import { Button } from '@/components/ui/Ubutton';

interface DatePickerProps {
  initialDate?: Date;
  onSelect: (date: Date) => void;
  onCancel: () => void;
}

export function DatePicker({ initialDate = new Date(), onSelect, onCancel }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate);

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        initialFocus
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => date && onSelect(date)}>
          Select
        </Button>
      </div>
    </div>
  );
} 