"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { IndustryUpdate } from '@/types/industry';

const CACHE_KEY = 'industry-updates-cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface IndustryUpdateFilters {
  startDate?: Date;
  endDate?: Date;
  industry?: string[];
  category?: string[];
  source?: string[];
  impact?: 'low' | 'medium' | 'high';
  relevance?: 'low' | 'medium' | 'high';
  status?: 'new' | 'read' | 'archived';
  tags?: string[];
  searchTerm?: string;
  sortBy?: 'date' | 'impact' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

interface UseIndustryUpdatesReturn {
  updates: IndustryUpdate[];
  loading: boolean;
  error: Error | null;
  filterUpdates: (filters: IndustryUpdateFilters) => Promise<void>;
  refreshUpdates: () => Promise<void>;
  addUpdate: (update: Omit<IndustryUpdate, 'id'>) => Promise<void>;
  updateUpdate: (id: string, update: Partial<IndustryUpdate>) => Promise<void>;
  deleteUpdate: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  archiveUpdate: (id: string) => Promise<void>;
}

export function useIndustryUpdates(userId: string): UseIndustryUpdatesReturn {
  const supabase = useSupabaseClient();
  const [updates, setUpdates] = useState<IndustryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  }, []);

  const setCachedData = useCallback((data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }, []);

  const loadUpdates = useCallback(async () => {
    try {
      setLoading(true);

      // Check cache first
      const cached = getCachedData();
      if (cached) {
        setUpdates(cached);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('industryUpdates')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      setUpdates(data);
      setCachedData(data);
    } catch (err) {
      console.error('Error loading industry updates:', err);
      setError(err instanceof Error ? err : new Error('Failed to load industry updates'));
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, getCachedData, setCachedData]);

  useEffect(() => {
    if (userId) {
      loadUpdates();
    }
  }, [userId, loadUpdates]);

  const addUpdate = async (update: Omit<IndustryUpdate, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('industryUpdates')
        .insert([{ ...update, userId }])
        .select()
        .single();

      if (error) throw error;

      setUpdates(prev => [data, ...prev]);

      // Update cache
      setCachedData([data, ...updates]);
    } catch (err) {
      console.error('Error adding industry update:', err);
      setError(err instanceof Error ? err : new Error('Failed to add industry update'));
    }
  };

  const updateUpdate = async (id: string, update: Partial<IndustryUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('industryUpdates')
        .update(update)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;

      setUpdates(prev =>
        prev.map(update => (update.id === id ? { ...update, ...data } : update))
      );

      // Update cache
      setCachedData(
        updates.map((update: IndustryUpdate) => (update.id === id ? { ...update, ...data } : update))
      );
    } catch (err) {
      console.error('Error updating industry update:', err);
      setError(err instanceof Error ? err : new Error('Failed to update industry update'));
    }
  };

  const deleteUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('industryUpdates')
        .delete()
        .eq('id', id)
        .eq('userId', userId);

      if (error) throw error;

      setUpdates(prev => prev.filter(update => update.id !== id));

      // Update cache
      setCachedData(updates.filter(update => update.id !== id));
    } catch (err) {
      console.error('Error deleting industry update:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete industry update'));
    }
  };

  const searchUpdates = async (query: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('industryUpdates')
        .select('*')
        .eq('userId', userId)
        .ilike('title', `%${query}%`)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      setUpdates(data);
      setCachedData(data);
    } catch (err) {
      console.error('Error searching industry updates:', err);
      setError(err instanceof Error ? err : new Error('Failed to search industry updates'));
    } finally {
      setLoading(false);
    }
  };

  const filterUpdates = async (filters: IndustryUpdateFilters) => {
    try {
      setLoading(true);

      let query = supabase
        .from('industryUpdates')
        .select('*')
        .eq('userId', userId);

      if (filters.startDate) {
        query = query.gte('createdAt', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('createdAt', filters.endDate.toISOString());
      }
      if (filters.industry) {
        query = query.in('industry', filters.industry);
      }
      if (filters.category) {
        query = query.in('category', filters.category);
      }
      if (filters.source) {
        query = query.in('source', filters.source);
      }
      if (filters.impact) {
        query = query.eq('impact', filters.impact);
      }
      if (filters.relevance) {
        query = query.eq('relevance', filters.relevance);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.tags) {
        query = query.in('tags', filters.tags);
      }
      if (filters.searchTerm) {
        query = query.ilike('title', `%${filters.searchTerm}%`);
      }
      if (filters.sortBy && filters.sortOrder) {
        query = query.order(filters.sortBy as string, { ascending: filters.sortOrder === 'asc' });
      }

      const { data, error } = await query.order('createdAt', { ascending: false });

      if (error) throw error;

      setUpdates(data);
      setCachedData(data);
    } catch (err) {
      console.error('Error filtering industry updates:', err);
      setError(err instanceof Error ? err : new Error('Failed to filter industry updates'));
    } finally {
      setLoading(false);
    }
  };

  const sortUpdates = async (field: keyof IndustryUpdate, direction: 'asc' | 'desc') => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('industryUpdates')
        .select('*')
        .eq('userId', userId)
        .order(field as string, { ascending: direction === 'asc' });

      if (error) throw error;

      setUpdates(data);
      setCachedData(data);
    } catch (err) {
      console.error('Error sorting industry updates:', err);
      setError(err instanceof Error ? err : new Error('Failed to sort industry updates'));
    } finally {
      setLoading(false);
    }
  };

  const refreshUpdates = async () => {
    await loadUpdates();
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('industryUpdates')
        .update({ status: 'read' })
        .eq('id', id)
        .eq('userId', userId);

      if (error) throw error;

      setUpdates(prev =>
        prev.map(update => (update.id === id ? { ...update, status: 'read' } : update))
      );

      // Update cache
      setCachedData(
        updates.map((update: IndustryUpdate) => (update.id === id ? { ...update, status: 'read' } : update))
      );
    } catch (err) {
      console.error('Error marking industry update as read:', err);
      setError(err instanceof Error ? err : new Error('Failed to mark industry update as read'));
    }
  };

  const archiveUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('industryUpdates')
        .update({ status: 'archived' })
        .eq('id', id)
        .eq('userId', userId);

      if (error) throw error;

      setUpdates(prev => prev.filter(update => update.id !== id));

      // Update cache
      setCachedData(updates.filter(update => update.id !== id));
    } catch (err) {
      console.error('Error archiving industry update:', err);
      setError(err instanceof Error ? err : new Error('Failed to archive industry update'));
    }
  };

  return {
    updates,
    loading,
    error,
    filterUpdates,
    refreshUpdates,
    addUpdate,
    updateUpdate,
    deleteUpdate,
    markAsRead,
    archiveUpdate,
  };
} 