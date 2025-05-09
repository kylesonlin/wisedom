-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    startDate TIMESTAMPTZ,
    endDate TIMESTAMPTZ,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create project members table
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(projectId, userId)
);

-- Create project milestones table
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create project analytics table
CREATE TABLE project_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    total_milestones INTEGER NOT NULL DEFAULT 0,
    completed_milestones INTEGER NOT NULL DEFAULT 0,
    active_members INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(projectId, date)
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(userId);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_start_date ON projects(startDate);
CREATE INDEX idx_projects_end_date ON projects(endDate);

CREATE INDEX idx_project_members_project_id ON project_members(projectId);
CREATE INDEX idx_project_members_user_id ON project_members(userId);
CREATE INDEX idx_project_members_role ON project_members(role);

CREATE INDEX idx_project_milestones_project_id ON project_milestones(projectId);
CREATE INDEX idx_project_milestones_status ON project_milestones(status);
CREATE INDEX idx_project_milestones_due_date ON project_milestones(dueDate);

CREATE INDEX idx_project_analytics_project_id ON project_analytics(projectId);
CREATE INDEX idx_project_analytics_date ON project_analytics(date);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects"
    ON projects
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own projects"
    ON projects
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own projects"
    ON projects
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own projects"
    ON projects
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for project members
CREATE POLICY "Users can view project members for their projects"
    ON project_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can add members to their projects"
    ON project_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can update members in their projects"
    ON project_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can remove members from their projects"
    ON project_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.projectId
            AND projects.userId = auth.uid()
        )
    );

-- Create RLS policies for project milestones
CREATE POLICY "Users can view milestones for their projects"
    ON project_milestones
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_milestones.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can create milestones for their projects"
    ON project_milestones
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_milestones.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can update milestones for their projects"
    ON project_milestones
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_milestones.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can delete milestones from their projects"
    ON project_milestones
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_milestones.projectId
            AND projects.userId = auth.uid()
        )
    );

-- Create RLS policies for project analytics
CREATE POLICY "Users can view analytics for their projects"
    ON project_analytics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_analytics.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can create analytics for their projects"
    ON project_analytics
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_analytics.projectId
            AND projects.userId = auth.uid()
        )
    );

CREATE POLICY "Users can update analytics for their projects"
    ON project_analytics
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_analytics.projectId
            AND projects.userId = auth.uid()
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_analytics_updated_at
    BEFORE UPDATE ON project_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 