import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { taskReminderCreateSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';

type TaskReminderCreate = z.infer<typeof taskReminderCreateSchema>;

interface TaskReminderDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReminderSet?: () => void;
}

export function TaskReminderDialog({
  taskId,
  open,
  onOpenChange,
  onReminderSet
}: TaskReminderDialogProps) {
  const [loading, setLoading] = useState(false);
  const [reminderType, setReminderType] = useState<'custom' | 'preset'>('preset');
  const [customDateTime, setCustomDateTime] = useState('');
  const [presetTime, setPresetTime] = useState('1h');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      let reminderTime: string;

      if (reminderType === 'custom') {
        reminderTime = customDateTime;
      } else {
        // Calculate reminder time based on preset
        const now = new Date();
        const [value, unit] = presetTime.split('');
        const hours = unit === 'h' ? parseInt(value) : 0;
        const minutes = unit === 'm' ? parseInt(value) : 0;
        now.setHours(now.getHours() + hours);
        now.setMinutes(now.getMinutes() + minutes);
        reminderTime = now.toISOString();
      }

      const reminderData: TaskReminderCreate = {
        taskId,
        reminder_time: reminderTime,
        status: 'pending'
      };

      const { error } = await supabase
        .from('task_reminders')
        .insert(reminderData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reminder set successfully'
      });

      onReminderSet?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set reminder',
        variant: 'destructive'
      });
      console.error('Error setting reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Task Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reminder Type</label>
            <Select
              value={reminderType}
              onValueChange={value => setReminderType(value as 'custom' | 'preset')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reminder type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preset">Preset Time</SelectItem>
                <SelectItem value="custom">Custom Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reminderType === 'preset' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preset Time</label>
              <Select
                value={presetTime}
                onValueChange={setPresetTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preset time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="30m">30 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="2h">2 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Date & Time</label>
              <Input
                type="datetime-local"
                value={customDateTime}
                onChange={e => setCustomDateTime(e.target.value)}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Set Reminder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 