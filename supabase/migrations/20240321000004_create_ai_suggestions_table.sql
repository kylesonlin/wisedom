-- Create AI suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contactId UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'follow_up',
        'introduction',
        'check_in',
        'opportunity',
        'risk'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    metadata JSONB,
    dismissed BOOLEAN NOT NULL DEFAULT false,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(userId);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_contact_id ON ai_suggestions(contactId);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON ai_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_priority ON ai_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_dismissed ON ai_suggestions(dismissed);

-- Create trigger for updating updatedAt
CREATE OR REPLACE FUNCTION update_ai_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_suggestions_updated_at
    BEFORE UPDATE ON ai_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_suggestions_updated_at();

-- Add RLS policies
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI suggestions"
    ON ai_suggestions FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own AI suggestions"
    ON ai_suggestions FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own AI suggestions"
    ON ai_suggestions FOR UPDATE
    USING (auth.uid() = userId)
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can delete their own AI suggestions"
    ON ai_suggestions FOR DELETE
    USING (auth.uid() = userId);

-- Create function to automatically create activity records for AI suggestions
CREATE OR REPLACE FUNCTION create_ai_suggestion_activity()
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
        'ai_suggestion',
        NEW.title,
        NEW.description,
        jsonb_build_object(
            'suggestionType', NEW.type,
            'priority', NEW.priority,
            'contactId', NEW.contactId
        ),
        NEW.userId,
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic activity creation
CREATE TRIGGER create_ai_suggestion_activity
    AFTER INSERT ON ai_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION create_ai_suggestion_activity(); 