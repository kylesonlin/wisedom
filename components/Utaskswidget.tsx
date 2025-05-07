'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from '@/components/ui/Ucard';
import { Button } from '@/components/ui/Ubutton';
import { Input } from '@/components/ui/Uinput';
import { useTheme } from '@/contexts/ThemeContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function TasksWidget() {
  const theme = useTheme();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('userId', user?.id)
        .order('createdAt', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error: createError } = await supabase
        .from('tasks')
        .insert([
          {
            ...newTask,
            status: 'pending',
            dueDate: new Date().toISOString(),
            userId: user.id,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      setTasks(prev => [data, ...prev]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
      });
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('userId', user?.id);

      if (updateError) throw updateError;

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTask(prev => ({ ...prev, title: e.target.value }));
  };

  if (!user) {
    return (
      <Card className="p-4">
        <div className="text-gray-500">Please sign in to view tasks</div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Tasks</h2>
      
      <form onSubmit={handleCreateTask} className="mb-4 space-y-2">
        <Input
          type="text"
          placeholder="New task title"
          value={newTask.title}
          onChange={handleInputChange}
          required
        />
        <Input
          type="text"
          placeholder="Description (optional)"
          value={newTask.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="default">
            Add Task
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {tasks.map(task => (
          <Card
            key={task.id}
            className="p-3 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-medium">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-500">{task.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={task.status}
                onChange={e => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
} 