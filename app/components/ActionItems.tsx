import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export default function ActionItems() {
  const actionItems: ActionItem[] = [
    {
      id: '1',
      title: 'Follow up with John about project proposal',
      dueDate: '2024-03-20',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      title: 'Schedule team meeting',
      dueDate: '2024-03-22',
      priority: 'medium',
      completed: false,
    },
    {
      id: '3',
      title: 'Review quarterly report',
      dueDate: '2024-03-25',
      priority: 'low',
      completed: true,
    },
  ];

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm p-4")}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Action Items</h3>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
            "h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          Add New
        </button>
      </div>
      <div className="space-y-3">
        {actionItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={item.completed}
                className="rounded border-gray-300"
                readOnly
              />
              <div>
                <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">Due: {item.dueDate}</p>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                item.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : item.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 