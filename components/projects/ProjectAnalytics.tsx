import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { projectAnalyticsSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';

type ProjectAnalytics = z.infer<typeof projectAnalyticsSchema>;

interface ProjectAnalyticsProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectAnalytics({
  projectId,
  open,
  onOpenChange
}: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ProjectAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (open) {
      loadAnalytics();
    }
  }, [open, projectId, timeRange]);

  const loadAnalytics = async () => {
    try {
      const supabase = getSupabaseClient();
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const { data, error } = await supabase
        .from('project_analytics')
        .select('*')
        .eq('projectId', projectId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive'
      });
      console.error('Error loading analytics:', error);
    }
  };

  const calculateMetrics = () => {
    if (analytics.length === 0) {
      return {
        taskCompletionRate: 0,
        milestoneCompletionRate: 0,
        averageActiveMembers: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalMilestones: 0,
        completedMilestones: 0
      };
    }

    const latest = analytics[analytics.length - 1];
    const totalTasks = latest.total_tasks;
    const completedTasks = latest.completed_tasks;
    const totalMilestones = latest.total_milestones;
    const completedMilestones = latest.completed_milestones;
    const averageActiveMembers = analytics.reduce((sum, a) => sum + a.active_members, 0) / analytics.length;

    return {
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      milestoneCompletionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
      averageActiveMembers,
      totalTasks,
      completedTasks,
      totalMilestones,
      completedMilestones
    };
  };

  const metrics = calculateMetrics();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Project Analytics</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-end">
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-500">Task Completion</h3>
              <div className="mt-2">
                <Progress value={metrics.taskCompletionRate} className="h-2" />
                <div className="mt-2 flex justify-between text-sm">
                  <span>{metrics.completedTasks} completed</span>
                  <span>{metrics.totalTasks} total</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-500">Milestone Completion</h3>
              <div className="mt-2">
                <Progress value={metrics.milestoneCompletionRate} className="h-2" />
                <div className="mt-2 flex justify-between text-sm">
                  <span>{metrics.completedMilestones} completed</span>
                  <span>{metrics.totalMilestones} total</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-500">Active Team Members</h3>
              <div className="mt-2">
                <div className="text-2xl font-semibold">
                  {Math.round(metrics.averageActiveMembers)}
                </div>
                <div className="text-sm text-gray-500">
                  Average active members
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Activity Timeline</h3>
            <div className="space-y-2">
              {analytics.map(analytics => (
                <Card key={analytics.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {new Date(analytics.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div>
                        Tasks: {analytics.completed_tasks}/{analytics.total_tasks}
                      </div>
                      <div>
                        Milestones: {analytics.completed_milestones}/{analytics.total_milestones}
                      </div>
                      <div>
                        Active Members: {analytics.active_members}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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