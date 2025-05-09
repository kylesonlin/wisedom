import { cn } from "@/lib/utils";

export type SuggestionType = 'email' | 'call' | 'meeting' | 'followuup';
export type PriorityType = 'high' | 'medium' | 'low';

export interface Suggestion {
  id: string;
  contactId: string;
  contactName: string;
  type: SuggestionType;
  priority: PriorityType;
  reason: string;
  suggestedAction: string;
  suggestedTime: Date;
  confidence?: number;
  notes?: string;
}

interface AIActionSuggestionsProps {
  suggestions: Suggestion[];
  onActionSelect: (suggestion: Suggestion) => void;
}

export default function AIActionSuggestions({
  suggestions: propSuggestions,
  onActionSelect = () => {},
}: AIActionSuggestionsProps) {
  const defaultSuggestions: AIActionSuggestionsProps['suggestions'] = [
    {
      id: '1',
      contactId: 'contact-1',
      contactName: 'John Doe',
      type: 'meeting',
      priority: 'high',
      reason: 'Based on recent interactions, it might be good to schedule a follow-up meeting with the client.',
      suggestedAction: 'Schedule a follow-up meeting',
      suggestedTime: new Date(),
      confidence: 0.8,
    },
    {
      id: '2',
      contactId: 'contact-2',
      contactName: 'Jane Smith',
      type: 'email',
      priority: 'medium',
      reason: 'The project timeline needs to be updated to reflect recent changes.',
      suggestedAction: 'Send an email with updated timeline',
      suggestedTime: new Date(),
      confidence: 0.6,
    },
    {
      id: '3',
      contactId: 'contact-3',
      contactName: 'Bob Johnson',
      type: 'call',
      priority: 'low',
      reason: 'Some documentation needs to be reviewed for accuracy.',
      suggestedAction: 'Schedule a call to review documentation',
      suggestedTime: new Date(),
      confidence: 0.4,
    },
  ];

  const suggestions = propSuggestions || defaultSuggestions;

  return (
    <div className={cn("rounded-lg border-[hsl(var(--border))] bg-card text-card-foreground shadow-sm p-4")}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">AI Suggestions</h3>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
            "h-9 px-3 border-[hsl(var(--input))] bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-3 rounded-md border-[hsl(var(--border))] bg-background"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium">{suggestion.suggestedAction}</h4>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  suggestion.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : suggestion.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {suggestion.priority}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onActionSelect(suggestion)}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                  "h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Accept
              </button>
              <button
                onClick={() => onActionSelect(suggestion)}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                  "h-8 px-3 border-[hsl(var(--input))] bg-background hover:bg-accent hover:text-accent-foreground"
                )}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 