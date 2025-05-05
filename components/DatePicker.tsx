"use client";

import React, { useState } from 'react';
import { format, addDays, isBefore, isAfter } from 'date-fns';

interface DatePickerProps {
  initialDate: Date;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onCancel: () => void;
}

export default function DatePicker({
  initialDate,
  minDate = new Date(),
  maxDate = addDays(new Date(), 30),
  onSelect,
  onCancel
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    if (isBefore(newDate, minDate)) {
      setSelectedDate(minDate);
    } else if (isAfter(newDate, maxDate)) {
      setSelectedDate(maxDate);
    } else {
      setSelectedDate(newDate);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = event.target.value.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedDate(newDate);
  };

  const handleSubmit = () => {
    onSelect(selectedDate);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Select New Date and Time</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              min={format(minDate, 'yyyy-MM-dd')}
              max={format(maxDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={format(selectedDate, 'HH:mm')}
              onChange={handleTimeChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 