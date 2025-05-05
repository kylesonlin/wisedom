import { createClient } from '@supabase/supabase-js';

// Database types
export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  project_id: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROJECT_FILES: 'project-files',
} as const;

const supabaseUrl = 'https://ldipduhdpeugwvxjbrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkaXBkZHVoZHBldWd3dnhqYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDIyMjQsImV4cCI6MjA2MTk3ODIyNH0.7JtcrzPIZjFAGwdJfLgTdLr8vUtSkLvGalF1J3iqPjs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
};

export const createProfile = async (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
};

// Storage helper functions
export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(filePath);

  return publicUrl;
};

export const uploadProjectFile = async (projectId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${projectId}-${Math.random()}.${fileExt}`;
  const filePath = `${projectId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.PROJECT_FILES)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.PROJECT_FILES)
    .getPublicUrl(filePath);

  return publicUrl;
}; 