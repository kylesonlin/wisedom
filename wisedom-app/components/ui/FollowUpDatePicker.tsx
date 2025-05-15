"use client"

import * as React from "react"
import { DatePicker } from "./DatePicker"
import { FollowUpSuggestion } from "@/utils/aiAnalysis"

interface FollowUpDatePickerProps {
  followUp: FollowUpSuggestion;
  onSelect: (followUp: FollowUpSuggestion, date: Date) => void;
  onCancel: () => void;
}

export function FollowUpDatePicker({
  followUp,
  onSelect,
  onCancel,
}: FollowUpDatePickerProps) {
  const handleSelect = React.useCallback((date: Date | undefined) => {
    if (date) {
      onSelect(followUp, date);
    }
    onCancel();
  }, [followUp, onSelect, onCancel]);

  return (
    <DatePicker
      initialDate={new Date(followUp.suggestedTime)}
      onSelect={handleSelect}
      onCancel={onCancel}
    />
  );
} 