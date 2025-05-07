"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FollowUpSuggestion } from '../utils/aiAnalysis'

interface AIActionSuggestionsProps {
  suggestions: FollowUpSuggestion[]
  onActionSelect: (suggestion: FollowUpSuggestion) => void
}

export default function AIActionSuggestions({ suggestions, onActionSelect }: AIActionSuggestionsProps) {
  if (!suggestions.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Action Suggestions</CardTitle>
        <CardDescription>Recommended actions based on your interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{suggestion.suggestedAction}</p>
                <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActionSelect(suggestion)}
              >
                Take Action
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 