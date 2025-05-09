import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MessageSquare, Phone, Mail, FileText, MoreHorizontal } from 'lucide-react';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import { format } from 'date-fns';

interface ContactActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface ContactActivityTimelineProps {
  contactId: string;
  onActivitySelect?: (activity: ContactActivity) => void;
}

const ACTIVITY_TYPES = {
  note: { icon: FileText, color: '#3B82F6', label: 'Note' },
  call: { icon: Phone, color: '#10B981', label: 'Call' },
  email: { icon: Mail, color: '#F59E0B', label: 'Email' },
  meeting: { icon: Calendar, color: '#8B5CF6', label: 'Meeting' },
  message: { icon: MessageSquare, color: '#EC4899', label: 'Message' }
};

export function ContactActivityTimeline({ contactId, onActivitySelect }: ContactActivityTimelineProps) {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    search: ''
  });

  useEffect(() => {
    loadActivities();
  }, [contactId]);

  const loadActivities = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('contactActivities')
        .select('*')
        .eq('contactId', contactId)
        .order('createdAt', { ascending: false });

      if (filter.type) {
        query = query.eq('type', filter.type);
      }

      if (filter.search) {
        query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load activities',
        variant: 'destructive'
      });
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const activityType = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
    if (!activityType) return MoreHorizontal;
    return activityType.icon;
  };

  const getActivityColor = (type: string) => {
    const activityType = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
    if (!activityType) return '#6B7280';
    return activityType.color;
  };

  const getActivityLabel = (type: string) => {
    const activityType = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
    if (!activityType) return type;
    return activityType.label;
  };

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select
          value={filter.type}
          onValueChange={(value) => {
            setFilter(prev => ({ ...prev, type: value }));
            loadActivities();
          }}
          options={[
            { value: '', label: 'All Types' },
            ...Object.entries(ACTIVITY_TYPES).map(([value, { label }]) => ({
              value,
              label
            }))
          ]}
          placeholder="Filter by type"
          className="w-48"
        />
        <Input
          value={filter.search}
          onChange={(e) => {
            setFilter(prev => ({ ...prev, search: e.target.value }));
            loadActivities();
          }}
          placeholder="Search activities..."
          className="flex-1"
        />
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const color = getActivityColor(activity.type);
          const label = getActivityLabel(activity.type);

          return (
            <Card
              key={activity.id}
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onActivitySelect?.(activity)}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium truncate">{activity.title}</h3>
                    <Badge
                      style={{ backgroundColor: `${color}20`, color }}
                      className="px-2 py-0.5"
                    >
                      {label}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No activities found
          </div>
        )}
      </div>
    </div>
  );
} 