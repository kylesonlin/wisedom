import { Card } from './ui/Card';

export interface ContactCardProps {
  id: string;
  name: string;
  email: string;
  className?: string;
  onViewProfile?: (id: string) => void;
  onMessage?: (id: string) => void;
}

export default function ContactCard({ 
  id, 
  name, 
  email, 
  className,
  onViewProfile,
  onMessage 
}: ContactCardProps) {
  return (
    <Card data-testid="contact-card" className={`p-4 ${className || ''}`}>
      <div className="space-y-2">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-500">{email}</p>
        <div className="flex space-x-2">
          <button 
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => onViewProfile?.(id)}
            aria-label={`View ${name}'s profile`}
          >
            View Profile
          </button>
          <button 
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => onMessage?.(id)}
            aria-label={`Message ${name}`}
          >
            Message
          </button>
        </div>
      </div>
    </Card>
  );
} 