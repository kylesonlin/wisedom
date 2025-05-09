-- Create activities table
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'task_created',
    'task_completed',
    'contact_added',
    'contact_updated',
    'project_created',
    'project_updated',
    'meeting_scheduled',
    'note_added'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relatedId UUID, -- ID of the related entity (task, contact, project, etc.)
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX activities_user_id_idx ON activities(userId);
CREATE INDEX activities_type_idx ON activities(type);
CREATE INDEX activities_created_at_idx ON activities(createdAt);
CREATE INDEX activities_related_id_idx ON activities(relatedId);

-- Create trigger for updatedAt
CREATE TRIGGER update_activities_updatedAt
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updatedAt_column();

-- Add RLS policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own activities"
  ON activities FOR UPDATE
  USING (auth.uid() = userId)
  WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (auth.uid() = userId);

-- Create function to automatically create activity records
CREATE OR REPLACE FUNCTION create_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (
    type,
    title,
    description,
    metadata,
    userId,
    relatedId
  ) VALUES (
    CASE
      WHEN TG_TABLE_NAME = 'tasks' THEN
        CASE
          WHEN TG_OP = 'INSERT' THEN 'task_created'
          WHEN TG_OP = 'UPDATE' AND NEW.status = 'completed' THEN 'task_completed'
          ELSE NULL
        END
      WHEN TG_TABLE_NAME = 'contacts' THEN
        CASE
          WHEN TG_OP = 'INSERT' THEN 'contact_added'
          WHEN TG_OP = 'UPDATE' THEN 'contact_updated'
          ELSE NULL
        END
      WHEN TG_TABLE_NAME = 'projects' THEN
        CASE
          WHEN TG_OP = 'INSERT' THEN 'project_created'
          WHEN TG_OP = 'UPDATE' THEN 'project_updated'
          ELSE NULL
        END
    END,
    CASE
      WHEN TG_TABLE_NAME = 'tasks' THEN NEW.title
      WHEN TG_TABLE_NAME = 'contacts' THEN NEW.name
      WHEN TG_TABLE_NAME = 'projects' THEN NEW.title
    END,
    CASE
      WHEN TG_TABLE_NAME = 'tasks' THEN NEW.description
      WHEN TG_TABLE_NAME = 'contacts' THEN NEW.notes
      WHEN TG_TABLE_NAME = 'projects' THEN NEW.description
    END,
    CASE
      WHEN TG_TABLE_NAME = 'tasks' THEN jsonb_build_object('status', NEW.status, 'priority', NEW.priority)
      WHEN TG_TABLE_NAME = 'contacts' THEN jsonb_build_object('email', NEW.email, 'phone', NEW.phone)
      WHEN TG_TABLE_NAME = 'projects' THEN jsonb_build_object('status', NEW.status, 'progress', NEW.progress)
    END,
    NEW.userId,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic activity creation
CREATE TRIGGER create_task_activity
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_activity();

CREATE TRIGGER create_contact_activity
  AFTER INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION create_activity();

CREATE TRIGGER create_project_activity
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_activity(); 