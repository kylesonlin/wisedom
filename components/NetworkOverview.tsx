'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';

interface Contact {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Connection {
  id: string;
  sourceContactId: string;
  targetContactId: string;
  type: 'colleague' | 'client' | 'partner' | 'vendor' | 'friend' | 'family' | 'other';
  strength: number;
  notes?: string;
}

const connectionColors: Record<Connection['type'], string> = {
  colleague: '#4CAF50',
  client: '#2196F3',
  partner: '#9C27B0',
  vendor: '#FF9800',
  friend: '#E91E63',
  family: '#673AB7',
  other: '#607D8B',
};

const CustomNode = ({ data }: { data: { label: string; avatarUrl?: string } }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
    <div className="flex items-center">
      {data.avatarUrl ? (
        <img
          src={data.avatarUrl}
          alt={data.label}
          className="w-8 h-8 rounded-full mr-2"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
          {data.label.charAt(0)}
        </div>
      )}
      <div className="font-medium">{data.label}</div>
    </div>
  </div>
);

const nodeTypes = {
  custom: CustomNode,
};

export default function NetworkOverview() {
  const theme = useTheme();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('userId', user?.id);

      if (contactsError) throw contactsError;

      // Load connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .eq('userId', user?.id);

      if (connectionsError) throw connectionsError;

      setContacts(contactsData || []);
      setConnections(connectionsData || []);

      // Create nodes and edges for the graph
      const nodes: Node[] = contactsData?.map((contact: Contact, index) => ({
        id: contact.id,
        type: 'custom',
        position: {
          x: Math.cos((index * 2 * Math.PI) / contactsData.length) * 300,
          y: Math.sin((index * 2 * Math.PI) / contactsData.length) * 300,
        },
        data: {
          label: contact.name,
          avatarUrl: contact.avatarUrl,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })) || [];

      const edges: Edge[] = connectionsData?.map((connection: Connection) => ({
        id: connection.id,
        source: connection.sourceContactId,
        target: connection.targetContactId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: connectionColors[connection.type],
          strokeWidth: connection.strength,
        },
        label: connection.type,
        labelStyle: { fill: connectionColors[connection.type] },
      })) || [];

      setNodes(nodes);
      setEdges(edges);
    } catch (err) {
      console.error('Error loading network data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = async (
    sourceId: string,
    targetId: string,
    type: Connection['type'],
    strength: number
  ) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert([
          {
            sourceContactId: sourceId,
            targetContactId: targetId,
            type,
            strength,
            userId: user?.id,
          },
        ])
        .select<'connections', Connection>()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      // Add new edge to the graph
      const newEdge: Edge = {
        id: data.id,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: connectionColors[type],
          strokeWidth: strength,
        },
        label: type,
        labelStyle: { fill: connectionColors[type] },
      };

      setEdges((eds) => [...eds, newEdge]);
    } catch (err) {
      console.error('Error adding connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to add connection');
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <Card className="p-4">
        <div className="text-gray-500">Please sign in to view network</div>
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Network Overview</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="h-[600px] border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Connection Types</h3>
          <div className="space-y-2">
            {Object.entries(connectionColors).map(([type, color]) => (
              <div key={type} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Quick Stats</h3>
          <div className="space-y-2">
            <div>Total Contacts: {contacts.length}</div>
            <div>Total Connections: {connections.length}</div>
            <div>
              Average Connections: {(connections.length / contacts.length).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 