import { Avatar, AvatarFallback, AvatarImage } from "./Uavatar";
import { Card, CardContent, CardHeader, CardTitle } from "./Ucard";
import { ScrollArea } from "./Uscroll-area";
import { formatDistanceToNow } from "date-fns";

interface Interaction {
  id: string;
  type: "email" | "call" | "meeting" | "note";
  timestamp: string;
  description: string;
  contactId: string;
  contactName: string;
  status: "completed" | "scheduled" | "missed";
  priority: "high" | "medium" | "low";
  notes?: string;
  duration?: number;
  outcome?: string;
  followUpDate?: string;
  tags?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  relatedTo?: {
    type: "project" | "task" | "opportunity";
    id: string;
    name: string;
  };
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  interactions: Interaction[];
  className?: string;
}

export function RecentActivity({
  interactions,
  className,
}: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={`/avatars/${interaction.contactId}.png`} />
                  <AvatarFallback>
                    {interaction.contactName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {interaction.contactName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {interaction.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{interaction.type}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(interaction.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
