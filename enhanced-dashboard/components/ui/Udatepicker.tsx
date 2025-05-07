"use client"

import React from 'react';
import { Calendar } from '@/components/ui/Ucalendar';
import type { DayPickerSingleProps } from 'react-day-picker';

interface DatePickerProps {
  initialDate: Date;
  onSelect: (date: Date) => void;
  onCancel: () => void;
}

export function DatePicker({ initialDate, onSelect, onCancel }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate);

  const handleSelect = () => {
    onSelect(selectedDate);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
        initialFocus
      />
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm rounded-md border hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSelect}
          className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
        >
          Select
        </button>
      </div>
    </div>
  );
} 