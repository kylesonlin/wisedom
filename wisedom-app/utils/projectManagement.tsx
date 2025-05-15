import { getSupabaseClient } from './supabase';
import { Project, ProjectMember, ProjectContact, Task, Milestone } from '../types/project';

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProject(projectId: string): Promise<Project> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('projectId', projectId);

  if (error) throw error;
  return data;
}

export async function addProjectMember(projectId: string, userId: string, role: string): Promise<ProjectMember> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_members')
    .insert({
      projectId: projectId,
      userId: userId,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectContacts(projectId: string): Promise<ProjectContact[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_contacts')
    .select('*')
    .eq('projectId', projectId);

  if (error) throw error;
  return data;
}

export async function addProjectContact(projectId: string, contactId: string): Promise<ProjectContact> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_contacts')
    .insert({
      projectId: projectId,
      contactId: contactId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('projectId', projectId);

  if (error) throw error;
  return data;
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('projectId', projectId);

  if (error) throw error;
  return data;
}

export async function createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Milestone> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('milestones')
    .insert({
      ...milestone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<Milestone> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('milestones')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectDetails(projectId: string): Promise<Project> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      teamMembers:project_members(*),
      contacts:project_contacts(*),
      tasks(*),
      milestones(*)
    `)
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      teamMembers:project_members(*)
    `)
    .or(`ownerId.eq.${userId},teamMembers.userId.eq.${userId}`);

  if (error) throw error;
  return data;
} 