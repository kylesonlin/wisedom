-- Create AI suggestions table
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('follow_up', 'introduction', 'check_in', 'opportunity', 'risk')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create AI feedback table
CREATE TABLE ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    suggestionId UUID NOT NULL REFERENCES ai_suggestions(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create AI analysis table
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('relationship', 'activity', 'communication', 'opportunity')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ai_suggestions_user_id ON ai_suggestions(userId);
CREATE INDEX idx_ai_suggestions_type ON ai_suggestions(type);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_priority ON ai_suggestions(priority);

CREATE INDEX idx_ai_feedback_user_id ON ai_feedback(userId);
CREATE INDEX idx_ai_feedback_suggestion_id ON ai_feedback(suggestionId);
CREATE INDEX idx_ai_feedback_rating ON ai_feedback(rating);

CREATE INDEX idx_ai_analysis_user_id ON ai_analysis(userId);
CREATE INDEX idx_ai_analysis_type ON ai_analysis(type);
CREATE INDEX idx_ai_analysis_confidence ON ai_analysis(confidence);

-- Enable Row Level Security
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for AI suggestions
CREATE POLICY "Users can view their own suggestions"
    ON ai_suggestions
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own suggestions"
    ON ai_suggestions
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own suggestions"
    ON ai_suggestions
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own suggestions"
    ON ai_suggestions
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for AI feedback
CREATE POLICY "Users can view their own feedback"
    ON ai_feedback
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own feedback"
    ON ai_feedback
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own feedback"
    ON ai_feedback
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own feedback"
    ON ai_feedback
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for AI analysis
CREATE POLICY "Users can view their own analysis"
    ON ai_analysis
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own analysis"
    ON ai_analysis
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own analysis"
    ON ai_analysis
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own analysis"
    ON ai_analysis
    FOR DELETE
    USING (auth.uid() = userId);

-- Create triggers for updated_at
CREATE TRIGGER update_ai_suggestions_updated_at
    BEFORE UPDATE ON ai_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_feedback_updated_at
    BEFORE UPDATE ON ai_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analysis_updated_at
    BEFORE UPDATE ON ai_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 