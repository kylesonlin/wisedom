"use client"

import * as React from "react"
import { DatePicker } from "./DatePicker"

interface ScheduledDatePickerProps {
  initialDate: Date
  onSelect: (date: Date | undefined) => void
  onCancel: () => void
}

export function ScheduledDatePicker({
  initialDate,
  onSelect,
  onCancel,
}: ScheduledDatePickerProps) {
  const handleSelect = React.useCallback((date: Date | undefined) => {
    onSelect(date);
  }, [onSelect]);

  return (
    <DatePicker
      initialDate={initialDate}
      onSelect={handleSelect}
      onCancel={onCancel}
    />
  );
} 