import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Contact, Activity } from '../types/contact';

interface UseContactsReturn {
  contacts: Contact[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  totalContacts: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & Partial<Pick<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

const CACHE_KEY = 'contacts_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 20;

export function useContacts(userId: string): UseContactsReturn {
  const supabase = useSupabaseClient();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalContacts, setTotalContacts] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadContacts = useCallback(async (pageNum: number = 1, shouldRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not refreshing
      if (!shouldRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setContacts(data.contacts);
            setActivities(data.activities);
            setTotalContacts(data.totalContacts);
            setHasMore(data.hasMore);
            setLoading(false);
            return;
          }
        }
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId);

      if (countError) throw countError;
      setTotalContacts(count || 0);

      // Get paginated contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('userId', userId)
        .order('updatedAt', { ascending: false })
        .range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

      if (contactsError) throw contactsError;

      // Get activities for these contacts
      const contactIds = contactsData?.map(c => c.id) || [];
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('userId', userId)
        .in('contactId', contactIds)
        .order('createdAt', { ascending: false });

      if (activitiesError) throw activitiesError;

      const newContacts = contactsData || [];
      const newActivities = activitiesData || [];

      if (pageNum === 1) {
        setContacts(newContacts);
        setActivities(newActivities);
      } else {
        setContacts(prev => [...prev, ...newContacts]);
        setActivities(prev => [...prev, ...newActivities]);
      }

      setHasMore(newContacts.length === pageSize);

      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        contacts: pageNum === 1 ? newContacts : [...contacts, ...newContacts],
        activities: pageNum === 1 ? newActivities : [...activities, ...newActivities],
        totalContacts: count || 0,
        hasMore: newContacts.length === pageSize,
        timestamp: Date.now(),
      }));

    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, pageSize]);

  useEffect(() => {
    if (userId) {
      loadContacts(1, true);
    }
  }, [userId, loadContacts]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadContacts(nextPage);
  };

  const refreshContacts = async () => {
    setPage(1);
    await loadContacts(1, true);
  };

  const addContact = async (contact: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ ...contact, userId }])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [data, ...prev]);
      setTotalContacts(prev => prev + 1);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          contacts: [data, ...cacheData.contacts],
          totalContacts: cacheData.totalContacts + 1,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error adding contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;

      setContacts(prev =>
        prev.map(contact => (contact.id === id ? { ...contact, ...data } : contact))
      );

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          contacts: cacheData.contacts.map((contact: Contact) =>
            contact.id === id ? { ...contact, ...data } : contact
          ),
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to update contact');
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('userId', userId);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      setActivities(prev => prev.filter(activity => activity.contactId !== id));
      setTotalContacts(prev => prev - 1);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          contacts: cacheData.contacts.filter((contact: Contact) => contact.id !== id),
          activities: cacheData.activities.filter((activity: Activity) => activity.contactId !== id),
          totalContacts: cacheData.totalContacts - 1,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & Partial<Pick<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const now = new Date();
      const newActivity: Activity = {
        id: activity.id || crypto.randomUUID(),
        userId: userId,
        contactId: activity.contactId || '',
        type: activity.type,
        title: activity.title,
        status: activity.status || 'pending',
        createdAt: activity.createdAt || now,
        updatedAt: activity.updatedAt || now,
        description: activity.description,
        priority: activity.priority,
        dueDate: activity.dueDate,
        completedAt: activity.completedAt,
        sentiment: activity.sentiment,
        topics: activity.topics,
        summary: activity.summary,
        metadata: activity.metadata,
      };
      const { data, error } = await supabase
        .from('activities')
        .insert([newActivity])
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev]);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          activities: [data, ...cacheData.activities],
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error adding activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const now = new Date();
      const updateData = {
        ...updates,
        updatedAt: now,
      };
      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;

      setActivities(prev =>
        prev.map(activity => (activity.id === id ? { ...activity, ...data } : activity))
      );

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          activities: cacheData.activities.map((activity: Activity) =>
            activity.id === id ? { ...activity, ...data } : activity
          ),
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity');
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('userId', userId);

      if (error) throw error;

      setActivities(prev => prev.filter(activity => activity.id !== id));

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          activities: cacheData.activities.filter((activity: Activity) => activity.id !== id),
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
    }
  };

  return {
    contacts,
    activities,
    loading,
    error,
    totalContacts,
    page,
    pageSize,
    hasMore,
    loadMore,
    refreshContacts,
    addContact,
    updateContact,
    deleteContact,
    addActivity,
    updateActivity,
    deleteActivity,
  };
} 