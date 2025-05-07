import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface IndustryUpdate {
  id: string;
  userId: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'news' | 'trend' | 'analysis' | 'opportunity';
  relevance: 'high' | 'medium' | 'low';
  metadata: {
    author?: string;
    tags?: string[];
    summary?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
  createdAt: string;
  updatedAt: string;
}

interface UseIndustryUpdatesReturn {
  updates: IndustryUpdate[];
  loading: boolean;
  error: string | null;
  totalUpdates: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshUpdates: () => Promise<void>;
  addUpdate: (update: Omit<IndustryUpdate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUpdate: (id: string, updates: Partial<IndustryUpdate>) => Promise<void>;
  deleteUpdate: (id: string) => Promise<void>;
}

const CACHE_KEY = 'industry_updates_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 20;

export function useIndustryUpdates(userId: string): UseIndustryUpdatesReturn {
  const supabase = useSupabaseClient();
  const [updates, setUpdates] = useState<IndustryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadUpdates = useCallback(async (pageNum: number = 1, shouldRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not refreshing
      if (!shouldRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setUpdates(data.updates);
            setTotalUpdates(data.totalUpdates);
            setHasMore(data.hasMore);
            setLoading(false);
            return;
          }
        }
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('industryUpdates')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId);

      if (countError) throw countError;
      setTotalUpdates(count || 0);

      // Get paginated updates
      const { data: updatesData, error: updatesError } = await supabase
        .from('industryUpdates')
        .select('*')
        .eq('userId', userId)
        .order('publishedAt', { ascending: false })
        .range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

      if (updatesError) throw updatesError;

      const newUpdates = updatesData || [];

      if (pageNum === 1) {
        setUpdates(newUpdates);
      } else {
        setUpdates(prev => [...prev, ...newUpdates]);
      }

      setHasMore(newUpdates.length === pageSize);

      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        updates: pageNum === 1 ? newUpdates : [...updates, ...newUpdates],
        totalUpdates: count || 0,
        hasMore: newUpdates.length === pageSize,
        timestamp: Date.now(),
      }));

    } catch (err) {
      console.error('Error loading industry updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load industry updates');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, pageSize]);

  useEffect(() => {
    if (userId) {
      loadUpdates(1, true);
    }
  }, [userId, loadUpdates]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadUpdates(nextPage);
  };

  const refreshUpdates = async () => {
    setPage(1);
    await loadUpdates(1, true);
  };

  const addUpdate = async (update: Omit<IndustryUpdate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('industryUpdates')
        .insert([{ ...update, userId }])
        .select()
        .single();

      if (error) throw error;

      setUpdates(prev => [data, ...prev]);
      setTotalUpdates(prev => prev + 1);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          updates: [data, ...cacheData.updates],
          totalUpdates: cacheData.totalUpdates + 1,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error adding industry update:', err);
      setError(err instanceof Error ? err.message : 'Failed to add industry update');
    }
  };

  const updateUpdate = async (id: string, updates: Partial<IndustryUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('industryUpdates')
        .update(updates)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;

      setUpdates(prev =>
        prev.map(update => (update.id === id ? { ...update, ...data } : update))
      );

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          updates: cacheData.updates.map((update: IndustryUpdate) =>
            update.id === id ? { ...update, ...data } : update
          ),
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error updating industry update:', err);
      setError(err instanceof Error ? err.message : 'Failed to update industry update');
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
      setTotalUpdates(prev => prev - 1);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          updates: cacheData.updates.filter((update: IndustryUpdate) => update.id !== id),
          totalUpdates: cacheData.totalUpdates - 1,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error deleting industry update:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete industry update');
    }
  };

  return {
    updates,
    loading,
    error,
    totalUpdates,
    page,
    pageSize,
    hasMore,
    loadMore,
    refreshUpdates,
    addUpdate,
    updateUpdate,
    deleteUpdate,
  };
} 