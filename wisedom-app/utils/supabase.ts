import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your Vercel environment configuration.');
}

const supabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export { supabaseClient as supabase };
export const getSupabaseClient = () => supabaseClient;

export { getProfile, updateProfile, uploadAvatar } from './supabaseHelpers';
export type { Profile } from './supabaseHelpers'; 