import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Plus, Pencil, Trash2, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { taskSchema, taskCreateSchema, taskUpdateSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { TaskReminderDialog } from './TaskReminderDialog';

type Task = z.infer<typeof taskSchema>;
type TaskCreate = z.infer<typeof taskCreateSchema>;
type TaskUpdate = z.infer<typeof taskUpdateSchema>;

interface TaskManagerProps {
  contactId?: string;
  projectId?: string;
  onTaskComplete?: (taskId: string) => void;
}

export function TaskManager({
  contactId,
  projectId,
  onTaskComplete
}: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<TaskCreate>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: undefined,
    contactId: contactId,
    projectId: projectId
  });
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [contactId, projectId]);

  const loadTasks = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('tasks')
        .select('*')
        .order('dueDate', { ascending: true });

      if (contactId) {
        query = query.eq('contactId', contactId);
      }
      if (projectId) {
        query = query.eq('projectId', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
      console.error('Error loading tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const taskData = {
        ...formData,
        contactId: contactId || formData.contactId,
        projectId: projectId || formData.projectId
      };

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Task updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Task created successfully'
        });
      }

      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: undefined,
        contactId: contactId,
        projectId: projectId
      });
      loadTasks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save task',
        variant: 'destructive'
      });
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      contactId: task.contactId,
      projectId: task.projectId
    });
  };

  const handleDelete = async (task: Task) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Task deleted successfully'
      });
      loadTasks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      if (newStatus === 'completed') {
        onTaskComplete?.(task.id);
      }

      toast({
        title: 'Success',
        description: 'Task status updated successfully'
      });
      loadTasks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
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

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'todo':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleReminderClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setReminderDialogOpen(true);
  };

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
              placeholder="Enter task title"
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
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={value => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
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

            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                Due Date
              </label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate || ''}
                onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingTask && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    status: 'todo',
                    dueDate: undefined,
                    contactId: contactId,
                    projectId: projectId
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search tasks..."
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
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    {task.status}
                  </div>
                </TableCell>
                <TableCell>
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(task)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(task)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {task.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(task, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {/* TODO: Implement reminder functionality */}}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 