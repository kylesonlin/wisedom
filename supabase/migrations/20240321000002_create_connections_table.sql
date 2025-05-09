-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sourceContactId UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    targetContactId UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('colleague', 'client', 'partner', 'vendor', 'friend', 'family', 'other')),
    strength INTEGER NOT NULL CHECK (strength BETWEEN 1 AND 5),
    notes TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(userId, sourceContactId, targetContactId)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(userId);
CREATE INDEX IF NOT EXISTS idx_connections_source_contact_id ON connections(sourceContactId);
CREATE INDEX IF NOT EXISTS idx_connections_target_contact_id ON connections(targetContactId);

-- Create trigger for updating updatedAt
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_connections_updated_at();

-- Add RLS policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
    ON connections FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own connections"
    ON connections FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own connections"
    ON connections FOR UPDATE
    USING (auth.uid() = userId)
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can delete their own connections"
    ON connections FOR DELETE
    USING (auth.uid() = userId); 