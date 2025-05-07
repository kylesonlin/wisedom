'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/Ucard';
import { Button } from '@/components/ui/Ubutton';
import { Input } from '@/components/ui/Uinput';

interface IndustryUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'news' | 'trend' | 'analysis' | 'event';
  relevance: 'high' | 'medium' | 'low';
  industry: string;
  metadata?: {
    author?: string;
    readTime?: number;
    tags?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

const categoryColors = {
  news: 'bg-blue-100 text-blue-800',
  trend: 'bg-purple-100 text-purple-800',
  analysis: 'bg-green-100 text-green-800',
  event: 'bg-orange-100 text-orange-800',
};

const relevanceColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
};

export default function IndustryUpdates() {
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const [updates, setUpdates] = useState<IndustryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRelevance, setSelectedRelevance] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'publishedAt' | 'relevance'>('publishedAt');

  useEffect(() => {
    if (user) {
      loadUpdates();
    }
  }, [user]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('industry_updates')
        .select('*')
        .eq('userId', user?.id)
        .order('publishedAt', { ascending: false });

      if (error) throw error;

      setUpdates(data);
    } catch (err) {
      console.error('Error loading industry updates:', err);
      setError('Failed to load industry updates');
    } finally {
      setLoading(false);
    }
  };

  const filteredUpdates = updates
    .filter(update => {
      const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.industry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || update.category === selectedCategory;
      const matchesRelevance = !selectedRelevance || update.relevance === selectedRelevance;

      return matchesSearch && matchesCategory && matchesRelevance;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'publishedAt':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'relevance':
          return getRelevanceWeight(b.relevance) - getRelevanceWeight(a.relevance);
        default:
          return 0;
      }
    });

  const getRelevanceWeight = (relevance: IndustryUpdate['relevance']): number => {
    switch (relevance) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

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
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Industry Updates</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={!selectedCategory ? 'bg-gray-100' : ''}
            >
              All Categories
            </Button>
            {Object.keys(categoryColors).map(category => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-gray-100' : ''}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedRelevance || ''}
            onChange={(e) => setSelectedRelevance(e.target.value || null)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Relevance</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="publishedAt">Sort by Date</option>
            <option value="relevance">Sort by Relevance</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No industry updates found
            </div>
          ) : (
            filteredUpdates.map(update => (
              <div
                key={update.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[update.category]}`}>
                      {update.category.charAt(0).toUpperCase() + update.category.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${relevanceColors[update.relevance]}`}>
                      {update.relevance.charAt(0).toUpperCase() + update.relevance.slice(1)} Relevance
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(update.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{update.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{update.content}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Source: {update.source}</span>
                  <span>Industry: {update.industry}</span>
                </div>
                {update.metadata?.tags && update.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {update.metadata.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(update.url, '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
} 