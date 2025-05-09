-- Create widget preferences table
CREATE TABLE IF NOT EXISTS widget_preferences (
    id TEXT PRIMARY KEY,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    order INTEGER NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(userId, id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_widget_preferences_user_id ON widget_preferences(userId);

-- Create trigger for updating updatedAt
CREATE OR REPLACE FUNCTION update_widget_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_widget_preferences_updated_at
    BEFORE UPDATE ON widget_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_widget_preferences_updated_at();

-- Add RLS policies
ALTER TABLE widget_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widget preferences"
    ON widget_preferences FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own widget preferences"
    ON widget_preferences FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own widget preferences"
    ON widget_preferences FOR UPDATE
    USING (auth.uid() = userId)
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can delete their own widget preferences"
    ON widget_preferences FOR DELETE
    USING (auth.uid() = userId); 