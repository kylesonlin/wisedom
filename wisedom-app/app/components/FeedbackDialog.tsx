"use client"

import * as React from "react"

import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Label } from "@/components/ui/Label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Textarea } from "@/components/ui/Textarea"
import { useToast } from "@/components/ui/useToast"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { toast } = useToast()
  const [feedbackType, setFeedbackType] = useState("suggestion")
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)
      setFeedbackText("")

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>Share your thoughts about the dashboard to help us improve.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <RadioGroup
                id="feedback-type"
                value={feedbackType}
                onValueChange={setFeedbackType}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suggestion" id="suggestion" />
                  <Label htmlFor="suggestion">Suggestion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="issue" id="issue" />
                  <Label htmlFor="issue">Issue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compliment" id="compliment" />
                  <Label htmlFor="compliment">Compliment</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you think..."
                value={feedbackText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackText(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !feedbackText.trim()}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 