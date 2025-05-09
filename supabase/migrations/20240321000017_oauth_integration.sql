-- Create OAuth providers table
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    auth_url TEXT NOT NULL,
    token_url TEXT NOT NULL,
    scope TEXT[] NOT NULL,
    redirect_uri TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create OAuth tokens table
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES oauth_providers(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    scope TEXT[] NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, provider_id)
);

-- Create indexes
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(userId);
CREATE INDEX idx_oauth_tokens_provider_id ON oauth_tokens(provider_id);
CREATE INDEX idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for oauth_providers
CREATE POLICY "OAuth providers are viewable by all authenticated users"
    ON oauth_providers
    FOR SELECT
    TO authenticated
    USING (true);

-- Create RLS policies for oauth_tokens
CREATE POLICY "Users can view their own OAuth tokens"
    ON oauth_tokens
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own OAuth tokens"
    ON oauth_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own OAuth tokens"
    ON oauth_tokens
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own OAuth tokens"
    ON oauth_tokens
    FOR DELETE
    USING (auth.uid() = userId);

-- Create triggers for updated_at
CREATE TRIGGER update_oauth_providers_updated_at
    BEFORE UPDATE ON oauth_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at
    BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default OAuth providers
INSERT INTO oauth_providers (name, client_id, client_secret, auth_url, token_url, scope, redirect_uri)
VALUES
    ('gmail', '', '', 'https://accounts.google.com/o/oauth2/v2/auth', 'https://oauth2.googleapis.com/token', 
     ARRAY['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.modify'],
     'http://localhost:3000/auth/callback/gmail'),
    ('calendar', '', '', 'https://accounts.google.com/o/oauth2/v2/auth', 'https://oauth2.googleapis.com/token',
     ARRAY['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
     'http://localhost:3000/auth/callback/calendar'); 