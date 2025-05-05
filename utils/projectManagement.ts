import { createClient } from '@supabase/supabase-js';
import { Project, ProjectMember, ProjectContact, Task, Milestone } from '../types/project';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updatedAt: new Date()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addProjectMember(projectId: string, member: Omit<ProjectMember, 'joinedAt'>): Promise<ProjectMember> {
  const { data, error } = await supabase
    .from('project_members')
    .insert({
      ...member,
      projectId,
      joinedAt: new Date()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addProjectContact(projectId: string, contact: Omit<ProjectContact, 'addedAt'>): Promise<ProjectContact> {
  const { data, error } = await supabase
    .from('project_contacts')
    .insert({
      ...contact,
      projectId,
      addedAt: new Date()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTask(projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updatedAt: new Date()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMilestone(projectId: string, milestone: Omit<Milestone, 'id'>): Promise<Milestone> {
  const { data, error } = await supabase
    .from('milestones')
    .insert({
      ...milestone,
      projectId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectDetails(projectId: string): Promise<Project> {
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

export async function getProjectContacts(projectId: string): Promise<ProjectContact[]> {
  const { data, error } = await supabase
    .from('project_contacts')
    .select('*')
    .eq('projectId', projectId);

  if (error) throw error;
  return data;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('projectId', projectId)
    .order('dueDate', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('projectId', projectId)
    .order('dueDate', { ascending: true });

  if (error) throw error;
  return data;
} 