import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { toast } from '@/utils/toast';
import { contactGroupSchema, contactGroupCreateSchema } from '@/utils/validation/schemas';
import { getSupabaseClient } from '@/utils/supabase';

interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  memberCount: number;
}

interface ContactGroupManagerProps {
  onGroupSelect?: (groupId: string) => void;
  selectedGroupId?: string;
}

export function ContactGroupManager({ onGroupSelect, selectedGroupId }: ContactGroupManagerProps) {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: groupsData, error: groupsError } = await supabase
        .from('contactGroups')
        .select(`
          id,
          name,
          description,
          color,
          icon,
          contactGroupMembers (count)
        `);

      if (groupsError) throw groupsError;

      setGroups(groupsData.map((group: any) => ({
        ...group,
        memberCount: group.contactGroupMembers?.[0]?.count || 0
      })));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contact groups',
        variant: 'destructive'
      });
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = contactGroupCreateSchema.parse(formData);
      const supabase = getSupabaseClient();

      if (editingGroup) {
        const { error } = await supabase
          .from('contactGroups')
          .update(validatedData)
          .eq('id', editingGroup.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Group updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('contactGroups')
          .insert([validatedData]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Group created successfully'
        });
      }

      setIsCreating(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', color: '#3B82F6', icon: '' });
      loadGroups();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save group',
        variant: 'destructive'
      });
      console.error('Error saving group:', error);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('contactGroups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Group deleted successfully'
      });
      loadGroups();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive'
      });
      console.error('Error deleting group:', error);
    }
  };

  const handleEdit = (group: ContactGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color || '#3B82F6',
      icon: group.icon || ''
    });
    setIsCreating(true);
  };

  if (loading) {
    return <div>Loading groups...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Contact Groups</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsCreating(true);
            setEditingGroup(null);
            setFormData({ name: '', description: '', color: '#3B82F6', icon: '' });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
                Icon
              </label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g., users, star, etc."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingGroup(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingGroup ? 'Update Group' : 'Create Group'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card
            key={group.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedGroupId === group.id ? 'border-primary' : ''
            }`}
            onClick={() => onGroupSelect?.(group.id)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    style={{ backgroundColor: group.color }}
                    className="px-2 py-1"
                  >
                    {group.icon ? (
                      <span className="mr-1">{group.icon}</span>
                    ) : (
                      <Users className="w-4 h-4 mr-1" />
                    )}
                    {group.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {group.memberCount} members
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(group);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(group.id);
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