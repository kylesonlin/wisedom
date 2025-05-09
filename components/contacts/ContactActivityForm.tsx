import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';

interface ContactActivityFormProps {
  contactId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    type: string;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
  };
}

const ACTIVITY_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'message', label: 'Message' }
];

export function ContactActivityForm({
  contactId,
  onSuccess,
  onCancel,
  initialData
}: ContactActivityFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'note',
    title: initialData?.title || '',
    description: initialData?.description || '',
    metadata: initialData?.metadata || {}
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('contactActivities')
        .insert([{
          contactId,
          ...formData
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Activity added successfully'
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add activity',
        variant: 'destructive'
      });
      console.error('Error adding activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Activity Type
          </label>
          <Select
            id="type"
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            options={ACTIVITY_TYPES}
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Activity'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 