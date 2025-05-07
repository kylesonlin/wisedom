-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    title TEXT,
    notes TEXT,
    additionalFields JSONB,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TIMESTAMP WITH TIME ZONE NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) NOT NULL,
    contactId UUID REFERENCES contacts(id) ON DELETE SET NULL,
    projectId UUID,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contactId UUID REFERENCES contacts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    summary TEXT,
    sentiment FLOAT CHECK (sentiment >= -1 AND sentiment <= 1),
    topics TEXT[],
    metadata JSONB,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create saved_views table
CREATE TABLE IF NOT EXISTS saved_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    filterOptions JSONB NOT NULL,
    sortOptions JSONB NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_contactId ON tasks(contactId);
CREATE INDEX IF NOT EXISTS idx_interactions_contactId ON interactions(contactId);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own contacts"
    ON contacts FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own contacts"
    ON contacts FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own contacts"
    ON contacts FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own contacts"
    ON contacts FOR DELETE
    USING (auth.uid() = userId);

CREATE POLICY "Users can view their own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = userId);

CREATE POLICY "Users can view their own interactions"
    ON interactions FOR SELECT
    USING (auth.uid() IN (
        SELECT userId FROM contacts 
        WHERE id = interactions.contactId
    ));

CREATE POLICY "Users can create interactions for their contacts"
    ON interactions FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT userId FROM contacts 
        WHERE id = interactions.contactId
    ));

CREATE POLICY "Users can update their own interactions"
    ON interactions FOR UPDATE
    USING (auth.uid() IN (
        SELECT userId FROM contacts 
        WHERE id = interactions.contactId
    ));

CREATE POLICY "Users can delete their own interactions"
    ON interactions FOR DELETE
    USING (auth.uid() IN (
        SELECT userId FROM contacts 
        WHERE id = interactions.contactId
    ));

CREATE POLICY "Users can view their own saved views"
    ON saved_views FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own saved views"
    ON saved_views FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own saved views"
    ON saved_views FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own saved views"
    ON saved_views FOR DELETE
    USING (auth.uid() = userId);

-- Create updatedAt trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactions_updated_at
    BEFORE UPDATE ON interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 