-- Add validation constraints
ALTER TABLE contacts
ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT valid_phone CHECK (phone ~* '^\+?[1-9]\d{1,14}$');

-- Add indexes for common queries
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_updated_at ON contacts(updated_at);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);

-- Add full text search
ALTER TABLE contacts
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name, '') || ' ' ||
    coalesce(email, '') || ' ' ||
    coalesce(company, '') || ' ' ||
    coalesce(title, '')
  )
) STORED;

CREATE INDEX idx_contacts_search ON contacts USING GIN(search_vector);

-- Add validation for tasks
ALTER TABLE tasks
ADD CONSTRAINT valid_due_date CHECK (due_date > created_at),
ADD CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high')),
ADD CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'completed'));

-- Add indexes for task queries
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);

-- Add validation for interactions
ALTER TABLE interactions
ADD CONSTRAINT valid_sentiment CHECK (sentiment >= -1 AND sentiment <= 1),
ADD CONSTRAINT valid_type CHECK (type IN ('email', 'call', 'meeting', 'note'));

-- Add indexes for interaction queries
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
CREATE INDEX idx_interactions_updated_at ON interactions(updated_at);

-- Add validation for user connections
ALTER TABLE user_connections
ADD CONSTRAINT valid_provider CHECK (provider IN ('gmail', 'linkedin', 'calendar')),
ADD CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'error'));

-- Add indexes for user connection queries
CREATE INDEX idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX idx_user_connections_provider ON user_connections(provider);
CREATE INDEX idx_user_connections_status ON user_connections(status);

-- Add validation for widget preferences
ALTER TABLE widget_preferences
ADD CONSTRAINT valid_position CHECK (position IN ('top', 'bottom', 'left', 'right')),
ADD CONSTRAINT valid_size CHECK (size IN ('small', 'medium', 'large'));

-- Add indexes for widget preference queries
CREATE INDEX idx_widget_preferences_user_id ON widget_preferences(user_id);
CREATE INDEX idx_widget_preferences_widget_id ON widget_preferences(widget_id);

-- Add validation for AI suggestions
ALTER TABLE ai_suggestions
ADD CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high')),
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add indexes for AI suggestion queries
CREATE INDEX idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX idx_ai_suggestions_priority ON ai_suggestions(priority);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);

-- Add validation for security events
ALTER TABLE security_events
ADD CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
ADD CONSTRAINT valid_type CHECK (type IN ('login', 'logout', 'password_change', 'permission_change'));

-- Add indexes for security event queries
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_type ON security_events(type); 