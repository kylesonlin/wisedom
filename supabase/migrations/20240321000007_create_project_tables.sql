-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    startDate TIMESTAMP WITH TIME ZONE,
    endDate TIMESTAMP WITH TIME ZONE,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    metadata JSONB DEFAULT '{}',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joinedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(projectId, userId)
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    taskId UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(projectId, taskId)
);

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(userId);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(startDate, endDate);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(projectId);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(userId);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON project_members(role);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(projectId);
CREATE INDEX IF NOT EXISTS idx_project_tasks_task_id ON project_tasks(taskId);
CREATE INDEX IF NOT EXISTS idx_project_tasks_order ON project_tasks(orderIndex);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(projectId);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON project_milestones(dueDate);

-- Create triggers for updating updatedAt
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Project policies
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = userId)
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = userId);

-- Project members policies
CREATE POLICY "Users can view project members of their projects"
    ON project_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_members.projectId
        AND projects.userId = auth.uid()
    ));

CREATE POLICY "Project owners can manage members"
    ON project_members FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_members.projectId
        AND projects.userId = auth.uid()
    ));

-- Project tasks policies
CREATE POLICY "Users can view tasks of their projects"
    ON project_tasks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_tasks.projectId
        AND projects.userId = auth.uid()
    ));

CREATE POLICY "Project owners can manage tasks"
    ON project_tasks FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_tasks.projectId
        AND projects.userId = auth.uid()
    ));

-- Project milestones policies
CREATE POLICY "Users can view milestones of their projects"
    ON project_milestones FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_milestones.projectId
        AND projects.userId = auth.uid()
    ));

CREATE POLICY "Project owners can manage milestones"
    ON project_milestones FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_milestones.projectId
        AND projects.userId = auth.uid()
    )); 