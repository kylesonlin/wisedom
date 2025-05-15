"use client"

import * as React from "react"
import { DatePicker } from "./DatePicker"
import { cn } from "@/lib/utils"

export interface FormDatePickerProps {
  label?: string
  value?: Date | null
  onChange?: (date: Date | null) => void
  error?: string
  className?: string
  placeholder?: string
}

export function FormDatePicker({
  label,
  value,
  onChange,
  error,
  className,
  placeholder = "Select date",
}: FormDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = React.useCallback((date: Date | undefined) => {
    onChange?.(date || null)
    setIsOpen(false)
  }, [onChange])

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive",
            className
          )}
        >
          {value ? value.toLocaleDateString() : placeholder}
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        {isOpen && (
          <div className="absolute z-50 mt-1">
            <DatePicker
              initialDate={value || undefined}
              onSelect={handleSelect}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
} 