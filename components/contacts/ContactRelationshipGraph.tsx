import React, { useState, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Users, Search, Filter } from 'lucide-react';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';

interface Contact {
  id: string;
  name: string;
  company?: string;
  title?: string;
  avatar?: string;
}

interface Relationship {
  id: string;
  sourceContactId: string;
  targetContactId: string;
  type: string;
  strength: number;
  notes?: string;
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    company?: string;
    title?: string;
    avatar?: string;
    val: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    type: string;
    strength: number;
    notes?: string;
  }>;
}

interface ContactRelationshipGraphProps {
  contactId: string;
  onContactSelect?: (contactId: string) => void;
  onRelationshipSelect?: (relationship: Relationship) => void;
}

const RELATIONSHIP_TYPES = [
  { value: 'colleague', label: 'Colleague', color: '#3B82F6' },
  { value: 'client', label: 'Client', color: '#10B981' },
  { value: 'partner', label: 'Partner', color: '#F59E0B' },
  { value: 'vendor', label: 'Vendor', color: '#8B5CF6' },
  { value: 'friend', label: 'Friend', color: '#EC4899' },
  { value: 'family', label: 'Family', color: '#EF4444' }
];

export function ContactRelationshipGraph({
  contactId,
  onContactSelect,
  onRelationshipSelect
}: ContactRelationshipGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    search: '',
    minStrength: 1
  });

  const loadRelationships = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();

      // Get the main contact
      const { data: mainContact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (contactError) throw contactError;

      // Get all relationships for this contact
      const { data: relationships, error: relError } = await supabase
        .from('connections')
        .select('*')
        .or(`sourceContactId.eq.${contactId},targetContactId.eq.${contactId}`);

      if (relError) throw relError;

      // Get all related contacts
      const relatedContactIds = relationships.map(rel =>
        rel.sourceContactId === contactId ? rel.targetContactId : rel.sourceContactId
      );

      const { data: relatedContacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .in('id', relatedContactIds);

      if (contactsError) throw contactsError;

      // Build graph data
      const nodes = [
        {
          id: mainContact.id,
          name: `${mainContact.firstName} ${mainContact.lastName}`,
          company: mainContact.company,
          title: mainContact.title,
          avatar: mainContact.avatar,
          val: 2
        },
        ...relatedContacts.map(contact => ({
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
          company: contact.company,
          title: contact.title,
          avatar: contact.avatar,
          val: 1
        }))
      ];

      const links = relationships.map(rel => ({
        source: rel.sourceContactId,
        target: rel.targetContactId,
        type: rel.type,
        strength: rel.strength,
        notes: rel.notes
      }));

      setGraphData({ nodes, links });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load relationships',
        variant: 'destructive'
      });
      console.error('Error loading relationships:', error);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    loadRelationships();
  }, [loadRelationships]);

  const handleNodeClick = (node: any) => {
    onContactSelect?.(node.id);
  };

  const handleLinkClick = (link: any) => {
    onRelationshipSelect?.({
      id: link.id,
      sourceContactId: link.source.id,
      targetContactId: link.target.id,
      type: link.type,
      strength: link.strength,
      notes: link.notes
    });
  };

  const getRelationshipColor = (type: string) => {
    const relationshipType = RELATIONSHIP_TYPES.find(t => t.value === type);
    return relationshipType?.color || '#6B7280';
  };

  if (loading) {
    return <div>Loading relationships...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select
          value={filter.type}
          onValueChange={(value) => {
            setFilter(prev => ({ ...prev, type: value }));
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {RELATIONSHIP_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={filter.search}
          onChange={(e) => {
            setFilter(prev => ({ ...prev, search: e.target.value }));
          }}
          placeholder="Search contacts..."
          className="flex-1"
        />
      </div>

      <Card className="p-4">
        <div className="h-[600px]">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={node => node.id === contactId ? '#3B82F6' : '#6B7280'}
            nodeRelSize={6}
            linkColor={link => getRelationshipColor(link.type)}
            linkWidth={link => link.strength}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
            cooldownTicks={100}
            onEngineStop={() => {
              // Optional: Add any post-layout adjustments here
            }}
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {RELATIONSHIP_TYPES.map(({ value, label, color }) => (
          <Badge
            key={value}
            style={{ backgroundColor: `${color}20`, color }}
            className="px-2 py-0.5"
          >
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
} 