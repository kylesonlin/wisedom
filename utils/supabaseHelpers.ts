// Moved from utils/supabase.tsx

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

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROJECT_FILES: 'projectufiles',
} as const;

export const getProfile = async (supabase: any, userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
};

export const createProfile = async (supabase: any, profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
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

export const updateProfile = async (supabase: any, userId: string, updates: Partial<Profile>) => {
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

export const uploadAvatar = async (supabase: any, userId: string, file: File) => {
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

export const uploadProjectFile = async (supabase: any, projectId: string, file: File) => {
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