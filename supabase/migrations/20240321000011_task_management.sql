-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TIMESTAMPTZ,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed')),
    contactId UUID REFERENCES contacts(id) ON DELETE SET NULL,
    projectId UUID REFERENCES projects(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task assignments table
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taskId UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(taskId, userId)
);

-- Create task reminders table
CREATE TABLE task_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taskId UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(userId);
CREATE INDEX idx_tasks_contact_id ON tasks(contactId);
CREATE INDEX idx_tasks_project_id ON tasks(projectId);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(dueDate);

CREATE INDEX idx_task_assignments_task_id ON task_assignments(taskId);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(userId);

CREATE INDEX idx_task_reminders_task_id ON task_reminders(taskId);
CREATE INDEX idx_task_reminders_user_id ON task_reminders(userId);
CREATE INDEX idx_task_reminders_status ON task_reminders(status);
CREATE INDEX idx_task_reminders_reminder_time ON task_reminders(reminder_time);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks"
    ON tasks
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own tasks"
    ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own tasks"
    ON tasks
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own tasks"
    ON tasks
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for task assignments
CREATE POLICY "Users can view task assignments for their tasks"
    ON task_assignments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_assignments.taskId
            AND tasks.userId = auth.uid()
        )
    );

CREATE POLICY "Users can create task assignments for their tasks"
    ON task_assignments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_assignments.taskId
            AND tasks.userId = auth.uid()
        )
    );

CREATE POLICY "Users can delete task assignments for their tasks"
    ON task_assignments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_assignments.taskId
            AND tasks.userId = auth.uid()
        )
    );

-- Create RLS policies for task reminders
CREATE POLICY "Users can view reminders for their tasks"
    ON task_reminders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_reminders.taskId
            AND tasks.userId = auth.uid()
        )
    );

CREATE POLICY "Users can create reminders for their tasks"
    ON task_reminders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_reminders.taskId
            AND tasks.userId = auth.uid()
        )
    );

CREATE POLICY "Users can update reminders for their tasks"
    ON task_reminders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_reminders.taskId
            AND tasks.userId = auth.uid()
        )
    );

CREATE POLICY "Users can delete reminders for their tasks"
    ON task_reminders
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_reminders.taskId
            AND tasks.userId = auth.uid()
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
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_reminders_updated_at
    BEFORE UPDATE ON task_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 