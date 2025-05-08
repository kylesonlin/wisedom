import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AIActionSuggestions() {
  const suggestions: Suggestion[] = [
    {
      id: '1',
      title: 'Schedule follow-up meeting',
      description: 'Based on recent interactions, it might be good to schedule a follow-up meeting with the client.',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Update project timeline',
      description: 'The project timeline needs to be updated to reflect recent changes.',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Review documentation',
      description: 'Some documentation needs to be reviewed for accuracy.',
      priority: 'low',
    },
  ];

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm p-4")}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">AI Suggestions</h3>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
            "h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-3 rounded-md border border-border bg-background"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium">{suggestion.title}</h4>
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
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            <div className="mt-3 flex gap-2">
              <button
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                  "h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Accept
              </button>
              <button
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                  "h-8 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
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