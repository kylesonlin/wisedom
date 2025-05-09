import { createClient } from '@supabase/supabase-js';

// Database types
export type Profile = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  projectId: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROJECT_FILES: 'projectufiles',
} as const;

// Validate environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Create Supabase client
export const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Database helper functions
export const getProfile = async (userId: string) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
};

export const createProfile = async (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }])
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
};

// Storage helper functions
export const uploadAvatar = async (userId: string, file: File) => {
  const supabase = getSupabaseClient();
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
  const supabase = getSupabaseClient();
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