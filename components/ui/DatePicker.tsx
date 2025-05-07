"use client"

import * as React from "react"
import { Calendar } from "./Calendar"
import { DayPickerSingleProps } from "react-day-picker"

export interface DatePickerProps extends Omit<DayPickerSingleProps, 'mode'> {
  initialDate?: Date
  onSelect?: (date: Date | undefined) => void
  onCancel?: () => void
}

export function DatePicker({
  initialDate,
  onSelect,
  onCancel,
  ...props
}: DatePickerProps) {
  const [selected, setSelected] = React.useState<Date | undefined>(initialDate)

  const handleSelect = (date: Date | undefined) => {
    setSelected(date)
    onSelect?.(date)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        initialFocus
        {...props}
      />
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => {
            handleSelect(undefined)
            onCancel?.()
          }}
          className="px-3 py-1 text-sm rounded-md border hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSelect(selected)}
          className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
        >
          Select
        </button>
      </div>
    </div>
  )
} 