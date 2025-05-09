-- Create calendar events table
CREATE TABLE calendar_events (
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

-- Create calendar availability table
CREATE TABLE calendar_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, day_of_week, start_time, end_time)
);

-- Create calendar sync status table
CREATE TABLE calendar_sync_status (
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
CREATE INDEX idx_calendar_events_user_id ON calendar_events(userId);
CREATE INDEX idx_calendar_events_calendar_id ON calendar_events(calendar_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_end_time ON calendar_events(end_time);

CREATE INDEX idx_calendar_availability_user_id ON calendar_availability(userId);
CREATE INDEX idx_calendar_availability_day_of_week ON calendar_availability(day_of_week);

CREATE INDEX idx_calendar_sync_status_user_id ON calendar_sync_status(userId);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar events
CREATE POLICY "Users can view their own calendar events"
    ON calendar_events
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own calendar events"
    ON calendar_events
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own calendar events"
    ON calendar_events
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own calendar events"
    ON calendar_events
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for calendar availability
CREATE POLICY "Users can view their own availability"
    ON calendar_availability
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own availability"
    ON calendar_availability
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own availability"
    ON calendar_availability
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own availability"
    ON calendar_availability
    FOR DELETE
    USING (auth.uid() = userId);

-- Create RLS policies for calendar sync status
CREATE POLICY "Users can view their own sync status"
    ON calendar_sync_status
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can create their own sync status"
    ON calendar_sync_status
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own sync status"
    ON calendar_sync_status
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own sync status"
    ON calendar_sync_status
    FOR DELETE
    USING (auth.uid() = userId);

-- Create triggers for updated_at
CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_availability_updated_at
    BEFORE UPDATE ON calendar_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_sync_status_updated_at
    BEFORE UPDATE ON calendar_sync_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 