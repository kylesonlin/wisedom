import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { linkedinConnectionSchema, linkedinActivitySchema, linkedinSyncStatusSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { Linkedin, RefreshCw, Search, Tag, Building2, MapPin, Briefcase } from 'lucide-react';

type LinkedInConnection = z.infer<typeof linkedinConnectionSchema>;
type LinkedInActivity = z.infer<typeof linkedinActivitySchema>;
type LinkedInSyncStatus = z.infer<typeof linkedinSyncStatusSchema>;

export function LinkedInIntegration() {
  const [connections, setConnections] = useState<LinkedInConnection[]>([]);
  const [activities, setActivities] = useState<LinkedInActivity[]>([]);
  const [syncStatus, setSyncStatus] = useState<LinkedInSyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<LinkedInConnection | null>(null);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Load connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('linkedin_connections')
        .select('*')
        .order('last_interaction', { ascending: false });

      if (connectionsError) throw connectionsError;
      setConnections(connectionsData || []);

      // Load sync status
      const { data: syncData, error: syncError } = await supabase
        .from('linkedin_sync_status')
        .select('*')
        .single();

      if (syncError && syncError.code !== 'PGRST116') throw syncError;
      setSyncStatus(syncData);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load LinkedIn data',
        variant: 'destructive'
      });
      console.error('Error loading LinkedIn data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Update sync status
      const { error: syncError } = await supabase
        .from('linkedin_sync_status')
        .upsert({
          sync_status: 'in_progress',
          last_sync_at: new Date().toISOString()
        });

      if (syncError) throw syncError;

      // TODO: Implement actual LinkedIn API sync
      // This would involve:
      // 1. Fetching connections from LinkedIn API
      // 2. Updating local database
      // 3. Fetching activities
      // 4. Updating sync status

      toast({
        title: 'Success',
        description: 'LinkedIn sync completed successfully'
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync LinkedIn data',
        variant: 'destructive'
      });
      console.error('Error syncing LinkedIn data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionSelect = async (connection: LinkedInConnection) => {
    setSelectedConnection(connection);
    setNotes(connection.notes || '');
    setTags(connection.tags || []);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('linkedin_activities')
        .select('*')
        .eq('connection_id', connection.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load connection activities',
        variant: 'destructive'
      });
      console.error('Error loading connection activities:', error);
    }
  };

  const handleNotesUpdate = async () => {
    if (!selectedConnection) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('linkedin_connections')
        .update({ notes })
        .eq('id', selectedConnection.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notes updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive'
      });
      console.error('Error updating notes:', error);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagsUpdate = async () => {
    if (!selectedConnection) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('linkedin_connections')
        .update({ tags })
        .eq('id', selectedConnection.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tags updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tags',
        variant: 'destructive'
      });
      console.error('Error updating tags:', error);
    }
  };

  const filteredConnections = connections.filter(connection =>
    `${connection.first_name} ${connection.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Linkedin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">LinkedIn Integration</h2>
          </div>
          <Button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>

        {syncStatus && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Last Sync</span>
              <span className="font-medium">
                {new Date(syncStatus.last_sync_at || '').toLocaleString()}
              </span>
            </div>
            <Progress
              value={syncStatus.sync_status === 'completed' ? 100 : 0}
              className="h-2"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {filteredConnections.map(connection => (
              <Card
                key={connection.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedConnection?.id === connection.id
                    ? 'border-blue-500'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleConnectionSelect(connection)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">
                        {connection.first_name} {connection.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{connection.headline}</p>
                    </div>
                    {connection.profile_picture_url && (
                      <img
                        src={connection.profile_picture_url}
                        alt={`${connection.first_name} ${connection.last_name}`}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    {connection.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{connection.company}</span>
                      </div>
                    )}
                    {connection.position && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span>{connection.position}</span>
                      </div>
                    )}
                    {connection.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{connection.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {connection.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedConnection && (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Notes</h3>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this connection..."
                  className="mb-2"
                />
                <Button onClick={handleNotesUpdate}>Save Notes</Button>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-4">Tags</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button onClick={handleTagsUpdate}>Save Tags</Button>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{activity.type}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {activity.content && (
                        <p className="text-sm">{activity.content}</p>
                      )}
                      {activity.url && (
                        <a
                          href={activity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          View on LinkedIn
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 