import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'follow-up' | 'meeting' | 'task';
}

export default function AIActionSuggestions() {
  const suggestions: Suggestion[] = [
    {
      id: '1',
      title: 'Schedule Coffee Meeting',
      description: 'Based on your recent interaction with Sarah, it might be a good time to catch up over coffee.',
      type: 'meeting',
    },
    {
      id: '2',
      title: 'Follow up on Project Proposal',
      description: 'It\'s been 5 days since you sent the proposal to the client. Consider following up.',
      type: 'follow-up',
    },
    {
      id: '3',
      title: 'Update LinkedIn Profile',
      description: 'Your profile hasn\'t been updated in 3 months. Consider adding your recent achievements.',
      type: 'task',
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">AI Suggestions</h3>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">{suggestion.title}</h4>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  suggestion.type === 'meeting'
                    ? 'bg-blue-100 text-blue-800'
                    : suggestion.type === 'follow-up'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {suggestion.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">Dismiss</Button>
              <Button variant="default" size="sm">Take Action</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 