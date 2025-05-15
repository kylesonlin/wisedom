import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { aiSuggestionSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { Star, StarHalf, StarOff, Check, X, MessageSquare } from 'lucide-react';

type AISuggestion = z.infer<typeof aiSuggestionSchema>;

export function AISuggestionManager() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load suggestions',
        variant: 'destructive'
      });
      console.error('Error loading suggestions:', error);
    }
  };

  const handleStatusChange = async (suggestion: AISuggestion, newStatus: AISuggestion['status']) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ status: newStatus })
        .eq('id', suggestion.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Suggestion status updated successfully'
      });
      loadSuggestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update suggestion status',
        variant: 'destructive'
      });
      console.error('Error updating suggestion status:', error);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuggestion) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('ai_feedback')
        .insert({
          suggestionId: selectedSuggestion.id,
          rating: feedbackRating,
          comment: feedbackComment
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feedback submitted successfully'
      });
      setFeedbackDialogOpen(false);
      setSelectedSuggestion(null);
      setFeedbackRating(0);
      setFeedbackComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive'
      });
      console.error('Error submitting feedback:', error);
    }
  };

  const getTypeColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'follow_up':
        return 'text-blue-500';
      case 'introduction':
        return 'text-green-500';
      case 'check_in':
        return 'text-yellow-500';
      case 'opportunity':
        return 'text-purple-500';
      case 'risk':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: AISuggestion['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'accepted':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'completed':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{suggestion.title}</h3>
                    <Badge variant="outline" className={getTypeColor(suggestion.type)}>
                      {suggestion.type}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(suggestion.status)}>
                      {suggestion.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{suggestion.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {suggestion.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(suggestion, 'accepted')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(suggestion, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedSuggestion(suggestion);
                      setFeedbackDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFeedback} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFeedbackRating(rating)}
                  >
                    {rating <= feedbackRating ? (
                      <Star className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <StarOff className="h-5 w-5 text-gray-300" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Comment
              </label>
              <Textarea
                id="comment"
                value={feedbackComment}
                onChange={e => setFeedbackComment(e.target.value)}
                placeholder="Enter your feedback..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFeedbackDialogOpen(false);
                  setSelectedSuggestion(null);
                  setFeedbackRating(0);
                  setFeedbackComment('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!feedbackRating}>
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 