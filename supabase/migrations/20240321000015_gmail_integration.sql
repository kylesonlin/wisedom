-- Create Gmail emails table
CREATE TABLE gmail_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gmail_id TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    subject TEXT,
    snippet TEXT,
    body TEXT,
    body_html TEXT,
    labels TEXT[],
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    received_at TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, gmail_id)
);

-- Create Gmail contacts table
CREATE TABLE gmail_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    photo_url TEXT,
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    labels TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, email)
);

-- Create Gmail calendar events table
CREATE TABLE gmail_calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    calendar_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
    attendees JSONB[],
    recurrence JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, event_id)
);

-- Create Gmail sync status table
CREATE TABLE gmail_sync_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_email_sync_at TIMESTAMPTZ,
    last_contact_sync_at TIMESTAMPTZ,
    last_calendar_sync_at TIMESTAMPTZ,
    email_sync_status TEXT NOT NULL CHECK (email_sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    contact_sync_status TEXT NOT NULL CHECK (contact_sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    calendar_sync_status TEXT NOT NULL CHECK (calendar_sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_gmail_emails_user_id ON gmail_emails(userId);
CREATE INDEX idx_gmail_emails_thread_id ON gmail_emails(thread_id);
CREATE INDEX idx_gmail_emails_from_email ON gmail_emails(from_email);
CREATE INDEX idx_gmail_emails_received_at ON gmail_emails(received_at);
CREATE INDEX idx_gmail_emails_labels ON gmail_emails USING GIN (labels);

CREATE INDEX idx_gmail_contacts_user_id ON gmail_contacts(userId);
CREATE INDEX idx_gmail_contacts_email ON gmail_contacts(email);
CREATE INDEX idx_gmail_contacts_labels ON gmail_contacts USING GIN (labels);

CREATE INDEX idx_gmail_calendar_events_user_id ON gmail_calendar_events(userId);
CREATE INDEX idx_gmail_calendar_events_calendar_id ON gmail_calendar_events(calendar_id);
CREATE INDEX idx_gmail_calendar_events_start_time ON gmail_calendar_events(start_time);
CREATE INDEX idx_gmail_calendar_events_end_time ON gmail_calendar_events(end_time);

CREATE INDEX idx_gmail_sync_status_user_id ON gmail_sync_status(userId);

-- Enable Row Level Security
ALTER TABLE gmail_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_sync_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Gmail emails
CREATE POLICY "Users can view their own emails"
    ON gmail_emails
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own emails"
    ON gmail_emails
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own emails"
    ON gmail_emails
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own emails"
    ON gmail_emails
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for Gmail contacts
CREATE POLICY "Users can view their own contacts"
    ON gmail_contacts
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own contacts"
    ON gmail_contacts
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own contacts"
    ON gmail_contacts
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own contacts"
    ON gmail_contacts
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for Gmail calendar events
CREATE POLICY "Users can view their own calendar events"
    ON gmail_calendar_events
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own calendar events"
    ON gmail_calendar_events
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own calendar events"
    ON gmail_calendar_events
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own calendar events"
    ON gmail_calendar_events
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for Gmail sync status
CREATE POLICY "Users can view their own sync status"
    ON gmail_sync_status
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own sync status"
    ON gmail_sync_status
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own sync status"
    ON gmail_sync_status
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own sync status"
    ON gmail_sync_status
    FOR DELETE
    USING (auth.uid() = userId);

-- Create triggers for updated_at
CREATE TRIGGER update_gmail_emails_updated_at
    BEFORE UPDATE ON gmail_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_contacts_updated_at
    BEFORE UPDATE ON gmail_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_calendar_events_updated_at
    BEFORE UPDATE ON gmail_calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_sync_status_updated_at
    BEFORE UPDATE ON gmail_sync_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 