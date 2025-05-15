import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import { Plus, Pencil, Trash2, Users, Calendar, BarChart2 } from 'lucide-react';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { projectSchema, projectCreateSchema, projectUpdateSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { ProjectTeamManager } from './ProjectTeamManager';
import { ProjectAnalytics } from './ProjectAnalytics';

type Project = z.infer<typeof projectSchema>;
type ProjectCreate = z.infer<typeof projectCreateSchema>;
type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectCreate>({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: undefined,
    endDate: undefined,
    progress: 0
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
      console.error('Error loading projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const projectData = {
        ...formData,
        progress: formData.progress || 0
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Project updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(projectData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Project created successfully'
        });
      }

      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: undefined,
        endDate: undefined,
        progress: 0
      });
      loadProjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive'
      });
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      progress: project.progress
    });
  };

  const handleDelete = async (project: Project) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });
      loadProjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
      console.error('Error deleting project:', error);
    }
  };

  const handleTeamClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setTeamDialogOpen(true);
  };

  const handleAnalyticsClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setAnalyticsDialogOpen(true);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'planning':
        return 'text-blue-500';
      case 'on_hold':
        return 'text-yellow-500';
      case 'completed':
        return 'text-purple-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesTab = activeTab === 'all' || project.status === activeTab;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData(prev => ({ ...prev, status: value as Project['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={value => setFormData(prev => ({ ...prev, priority: value as Project['priority'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="progress" className="text-sm font-medium">
              Progress
            </label>
            <div className="flex items-center gap-4">
              <Progress value={formData.progress} className="flex-1" />
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={e => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingProject && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingProject(null);
                  setFormData({
                    title: '',
                    description: '',
                    status: 'planning',
                    priority: 'medium',
                    startDate: undefined,
                    endDate: undefined,
                    progress: 0
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="on_hold">On Hold</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map(project => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="w-24" />
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(project.startDate).toLocaleDateString()}
                      </div>
                    )}
                    {project.endDate && (
                      <>
                        <span>-</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.endDate).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTeamClick(project.id)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAnalyticsClick(project.id)}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {selectedProjectId && (
        <>
          <ProjectTeamManager
            projectId={selectedProjectId}
            open={teamDialogOpen}
            onOpenChange={setTeamDialogOpen}
          />
          <ProjectAnalytics
            projectId={selectedProjectId}
            open={analyticsDialogOpen}
            onOpenChange={setAnalyticsDialogOpen}
          />
        </>
      )}
    </div>
  );
} 