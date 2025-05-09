import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { toast } from '@/utils/toast';
import { contactTagSchema, contactTagCreateSchema } from '@/utils/validation/schemas';
import { getSupabaseClient } from '@/utils/supabase';

interface ContactTag {
  id: string;
  name: string;
  color: string;
  contactCount: number;
}

interface ContactTagManagerProps {
  onTagSelect?: (tagId: string) => void;
  selectedTagIds?: string[];
}

export function ContactTagManager({ onTagSelect, selectedTagIds = [] }: ContactTagManagerProps) {
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<ContactTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: tagsData, error: tagsError } = await supabase
        .from('contactTags')
        .select(`
          id,
          name,
          color,
          contactTagAssignments (count)
        `);

      if (tagsError) throw tagsError;

      setTags(tagsData.map((tag: any) => ({
        ...tag,
        contactCount: tag.contactTagAssignments?.[0]?.count || 0
      })));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contact tags',
        variant: 'destructive'
      });
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = contactTagCreateSchema.parse(formData);
      const supabase = getSupabaseClient();

      if (editingTag) {
        const { error } = await supabase
          .from('contactTags')
          .update(validatedData)
          .eq('id', editingTag.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Tag updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('contactTags')
          .insert([validatedData]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Tag created successfully'
        });
      }

      setIsCreating(false);
      setEditingTag(null);
      setFormData({ name: '', color: '#3B82F6' });
      loadTags();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save tag',
        variant: 'destructive'
      });
      console.error('Error saving tag:', error);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('contactTags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Tag deleted successfully'
      });
      loadTags();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive'
      });
      console.error('Error deleting tag:', error);
    }
  };

  const handleEdit = (tag: ContactTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color
    });
    setIsCreating(true);
  };

  if (loading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Contact Tags</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsCreating(true);
            setEditingTag(null);
            setFormData({ name: '', color: '#3B82F6' });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Tag
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tag Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingTag(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {tags.map((tag) => (
          <Card
            key={tag.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedTagIds.includes(tag.id) ? 'border-primary' : ''
            }`}
            onClick={() => onTagSelect?.(tag.id)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    style={{ backgroundColor: tag.color }}
                    className="px-2 py-1"
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    {tag.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {tag.contactCount} contacts
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(tag);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(tag.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 