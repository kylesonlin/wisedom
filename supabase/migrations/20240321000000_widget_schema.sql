-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create activities table for tracking interactions and action items
CREATE TABLE "activities" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "contactId" UUID REFERENCES "contacts"("id") ON DELETE SET NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ('email', 'call', 'meeting', 'message', 'action_item')),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL CHECK ("status" IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    "priority" TEXT CHECK ("priority" IN ('high', 'medium', 'low')),
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table for upcoming events
CREATE TABLE "events" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL CHECK ("type" IN ('conference', 'networking', 'workshop', 'webinar')),
    "status" TEXT NOT NULL CHECK ("status" IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
    "industry" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create industry updates table
CREATE TABLE "industryUpdates" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "publishedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "category" TEXT NOT NULL CHECK ("category" IN ('news', 'trend', 'analysis', 'event')),
    "relevance" TEXT NOT NULL CHECK ("relevance" IN ('high', 'medium', 'low')),
    "industry" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI suggestions table
CREATE TABLE "aiSuggestions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL CHECK ("type" IN ('connection', 'meeting', 'follow_up', 'opportunity')),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL CHECK ("priority" IN ('high', 'medium', 'low')),
    "status" TEXT NOT NULL CHECK ("status" IN ('pending', 'accepted', 'dismissed')) DEFAULT 'pending',
    "contactId" UUID REFERENCES "contacts"("id") ON DELETE SET NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX "activities_userId_idx" ON "activities"("userId");
CREATE INDEX "activities_contactId_idx" ON "activities"("contactId");
CREATE INDEX "activities_type_idx" ON "activities"("type");
CREATE INDEX "activities_status_idx" ON "activities"("status");
CREATE INDEX "activities_dueDate_idx" ON "activities"("dueDate");

CREATE INDEX "events_userId_idx" ON "events"("userId");
CREATE INDEX "events_startDate_idx" ON "events"("startDate");
CREATE INDEX "events_type_idx" ON "events"("type");
CREATE INDEX "events_status_idx" ON "events"("status");

CREATE INDEX "industryUpdates_userId_idx" ON "industryUpdates"("userId");
CREATE INDEX "industryUpdates_publishedAt_idx" ON "industryUpdates"("publishedAt");
CREATE INDEX "industryUpdates_category_idx" ON "industryUpdates"("category");
CREATE INDEX "industryUpdates_relevance_idx" ON "industryUpdates"("relevance");

CREATE INDEX "aiSuggestions_userId_idx" ON "aiSuggestions"("userId");
CREATE INDEX "aiSuggestions_type_idx" ON "aiSuggestions"("type");
CREATE INDEX "aiSuggestions_priority_idx" ON "aiSuggestions"("priority");
CREATE INDEX "aiSuggestions_status_idx" ON "aiSuggestions"("status");

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON "activities"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON "events"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industryUpdates_updated_at
    BEFORE UPDATE ON "industryUpdates"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aiSuggestions_updated_at
    BEFORE UPDATE ON "aiSuggestions"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "industryUpdates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aiSuggestions" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activities"
    ON "activities" FOR SELECT
    USING ("userId" = auth.uid());

CREATE POLICY "Users can insert their own activities"
    ON "activities" FOR INSERT
    WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own activities"
    ON "activities" FOR UPDATE
    USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own activities"
    ON "activities" FOR DELETE
    USING ("userId" = auth.uid());

-- Similar policies for events
CREATE POLICY "Users can view their own events"
    ON "events" FOR SELECT
    USING ("userId" = auth.uid());

CREATE POLICY "Users can insert their own events"
    ON "events" FOR INSERT
    WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own events"
    ON "events" FOR UPDATE
    USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own events"
    ON "events" FOR DELETE
    USING ("userId" = auth.uid());

-- Similar policies for industry updates
CREATE POLICY "Users can view their own industry updates"
    ON "industryUpdates" FOR SELECT
    USING ("userId" = auth.uid());

CREATE POLICY "Users can insert their own industry updates"
    ON "industryUpdates" FOR INSERT
    WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own industry updates"
    ON "industryUpdates" FOR UPDATE
    USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own industry updates"
    ON "industryUpdates" FOR DELETE
    USING ("userId" = auth.uid());

-- Similar policies for AI suggestions
CREATE POLICY "Users can view their own AI suggestions"
    ON "aiSuggestions" FOR SELECT
    USING ("userId" = auth.uid());

CREATE POLICY "Users can insert their own AI suggestions"
    ON "aiSuggestions" FOR INSERT
    WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own AI suggestions"
    ON "aiSuggestions" FOR UPDATE
    USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own AI suggestions"
    ON "aiSuggestions" FOR DELETE
    USING ("userId" = auth.uid()); 