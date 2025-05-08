import { cn } from "@/lib/utils";

export interface ContactCardProps {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  lastContact: string;
  nextFollowUp: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

export default function ContactCard({
  name,
  email,
  company,
  role,
  lastContact,
  nextFollowUp,
  tags,
  priority,
}: ContactCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground p-4")}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{role} at {company}</p>
        </div>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded",
            priority === 'high'
              ? "bg-red-100 text-red-800"
              : priority === 'medium'
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          )}
        >
          {priority}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm">
          <span className="text-muted-foreground">Email:</span> {email}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Last Contact:</span> {lastContact}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Next Follow-up:</span> {nextFollowUp}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
            "h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Contact
        </button>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
            "h-8 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          View Details
        </button>
      </div>
    </div>
  );
} 