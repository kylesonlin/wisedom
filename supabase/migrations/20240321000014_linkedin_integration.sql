-- Create LinkedIn connections table
CREATE TABLE linkedin_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    linkedin_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    headline TEXT,
    profile_url TEXT,
    profile_picture_url TEXT,
    company TEXT,
    position TEXT,
    location TEXT,
    industry TEXT,
    connection_strength INTEGER CHECK (connection_strength >= 1 AND connection_strength <= 3),
    last_interaction TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, linkedin_id)
);

-- Create LinkedIn activity table
CREATE TABLE linkedin_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES linkedin_connections(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'post', 'comment', 'reaction', 'profile_view')),
    content TEXT,
    url TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create LinkedIn sync status table
CREATE TABLE linkedin_sync_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_linkedin_connections_user_id ON linkedin_connections(userId);
CREATE INDEX idx_linkedin_connections_linkedin_id ON linkedin_connections(linkedin_id);
CREATE INDEX idx_linkedin_connections_company ON linkedin_connections(company);
CREATE INDEX idx_linkedin_connections_industry ON linkedin_connections(industry);

CREATE INDEX idx_linkedin_activities_user_id ON linkedin_activities(userId);
CREATE INDEX idx_linkedin_activities_connection_id ON linkedin_activities(connection_id);
CREATE INDEX idx_linkedin_activities_type ON linkedin_activities(type);
CREATE INDEX idx_linkedin_activities_timestamp ON linkedin_activities(timestamp);

CREATE INDEX idx_linkedin_sync_status_user_id ON linkedin_sync_status(userId);
CREATE INDEX idx_linkedin_sync_status_last_sync ON linkedin_sync_status(last_sync_at);

-- Enable Row Level Security
ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_sync_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for LinkedIn connections
CREATE POLICY "Users can view their own LinkedIn connections"
    ON linkedin_connections
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own LinkedIn connections"
    ON linkedin_connections
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own LinkedIn connections"
    ON linkedin_connections
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own LinkedIn connections"
    ON linkedin_connections
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for LinkedIn activities
CREATE POLICY "Users can view their own LinkedIn activities"
    ON linkedin_activities
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own LinkedIn activities"
    ON linkedin_activities
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own LinkedIn activities"
    ON linkedin_activities
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own LinkedIn activities"
    ON linkedin_activities
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for LinkedIn sync status
CREATE POLICY "Users can view their own LinkedIn sync status"
    ON linkedin_sync_status
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own LinkedIn sync status"
    ON linkedin_sync_status
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own LinkedIn sync status"
    ON linkedin_sync_status
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own LinkedIn sync status"
    ON linkedin_sync_status
    FOR DELETE
    USING (auth.uid() = userId);

-- Create triggers for updated_at
CREATE TRIGGER update_linkedin_connections_updated_at
    BEFORE UPDATE ON linkedin_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_activities_updated_at
    BEFORE UPDATE ON linkedin_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_sync_status_updated_at
    BEFORE UPDATE ON linkedin_sync_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 