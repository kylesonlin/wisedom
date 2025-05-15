import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { projectMemberSchema, projectMemberCreateSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';

type ProjectMember = z.infer<typeof projectMemberSchema>;
type ProjectMemberCreate = z.infer<typeof projectMemberCreateSchema>;

interface ProjectTeamManagerProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectTeamManager({
  projectId,
  open,
  onOpenChange
}: ProjectTeamManagerProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<ProjectMemberCreate>({
    projectId,
    userId: '',
    role: 'member'
  });

  useEffect(() => {
    if (open) {
      loadMembers();
    }
  }, [open, projectId]);

  const loadMembers = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          users:userId (
            id,
            email,
            metadata
          )
        `)
        .eq('projectId', projectId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive'
      });
      console.error('Error loading team members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('project_members')
        .insert(formData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team member added successfully'
      });

      setFormData({
        projectId,
        userId: '',
        role: 'member'
      });
      loadMembers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add team member',
        variant: 'destructive'
      });
      console.error('Error adding team member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (member: ProjectMember) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team member removed successfully'
      });
      loadMembers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive'
      });
      console.error('Error removing team member:', error);
    }
  };

  const getRoleColor = (role: ProjectMember['role']) => {
    switch (role) {
      case 'owner':
        return 'text-purple-500';
      case 'admin':
        return 'text-blue-500';
      case 'member':
        return 'text-green-500';
      case 'viewer':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredMembers = members.filter(member => {
    const userEmail = member.users?.email || '';
    return userEmail.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Project Team</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="userId" className="text-sm font-medium">
                  User Email
                </label>
                <Input
                  id="userId"
                  type="email"
                  value={formData.userId}
                  onChange={e => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Enter user email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={formData.role}
                  onValueChange={value => setFormData(prev => ({ ...prev, role: value as ProjectMember['role'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                Add Team Member
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Team Members</h3>
              <Input
                type="search"
                placeholder="Search members..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>{member.users?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 