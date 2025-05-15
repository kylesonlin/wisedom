import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from '@/utils/toast';
import { getSupabaseClient } from '@/utils/supabase';
import type { aiAnalysisSchema } from '@/utils/validation/schemas';
import type { z } from 'zod';
import { BarChart2, TrendingUp, Users, MessageSquare } from 'lucide-react';

type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

export function AIAnalysisManager() {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<AIAnalysis['type']>('relationship');

  useEffect(() => {
    loadAnalyses();
  }, [analysisType]);

  const loadAnalyses = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('type', analysisType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analyses',
        variant: 'destructive'
      });
      console.error('Error loading analyses:', error);
    }
  };

  const getTypeColor = (type: AIAnalysis['type']) => {
    switch (type) {
      case 'relationship':
        return 'text-blue-500';
      case 'activity':
        return 'text-green-500';
      case 'communication':
        return 'text-purple-500';
      case 'opportunity':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: AIAnalysis['type']) => {
    switch (type) {
      case 'relationship':
        return <Users className="h-4 w-4" />;
      case 'activity':
        return <BarChart2 className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select
          value={analysisType}
          onValueChange={value => setAnalysisType(value as AIAnalysis['type'])}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select analysis type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relationship">Relationship Analysis</SelectItem>
            <SelectItem value="activity">Activity Analysis</SelectItem>
            <SelectItem value="communication">Communication Analysis</SelectItem>
            <SelectItem value="opportunity">Opportunity Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analyses.map(analysis => (
          <Card key={analysis.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(analysis.type)}
                    <h3 className="text-lg font-medium">{analysis.title}</h3>
                    <Badge variant="outline" className={getTypeColor(analysis.type)}>
                      {analysis.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{analysis.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-medium">{Math.round(analysis.confidence * 100)}%</span>
                </div>
                <Progress value={analysis.confidence * 100} className="h-2" />
              </div>

              {analysis.metadata && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Additional Insights</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{key}</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 