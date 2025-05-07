-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    "username" TEXT UNIQUE,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "title" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create activities table
CREATE TABLE IF NOT EXISTS "activities" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "relatedId" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create connections table
CREATE TABLE IF NOT EXISTS "connections" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "sourceContactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    "targetContactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    "type" TEXT NOT NULL CHECK (type IN ('colleague', 'friend', 'family', 'business', 'other')),
    "strength" INTEGER NOT NULL CHECK (strength BETWEEN 1 AND 10),
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("sourceContactId", "targetContactId")
);

-- Create widget preferences table
CREATE TABLE IF NOT EXISTS "widgetPreferences" (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("userId", "id")
);

-- Create AI suggestions table
CREATE TABLE IF NOT EXISTS "aiSuggestions" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "contactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    "type" TEXT NOT NULL CHECK (type IN (
        'follow_up',
        'introduction',
        'check_in',
        'opportunity',
        'risk'
    )),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    "metadata" JSONB,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_profiles_username" ON "profiles"("username");
CREATE INDEX IF NOT EXISTS "idx_contacts_user_id" ON "contacts"("userId");
CREATE INDEX IF NOT EXISTS "idx_activities_user_id" ON "activities"("userId");
CREATE INDEX IF NOT EXISTS "idx_activities_type" ON "activities"("type");
CREATE INDEX IF NOT EXISTS "idx_connections_user_id" ON "connections"("userId");
CREATE INDEX IF NOT EXISTS "idx_connections_source" ON "connections"("sourceContactId");
CREATE INDEX IF NOT EXISTS "idx_connections_target" ON "connections"("targetContactId");
CREATE INDEX IF NOT EXISTS "idx_widget_preferences_user_id" ON "widgetPreferences"("userId");
CREATE INDEX IF NOT EXISTS "idx_ai_suggestions_user_id" ON "aiSuggestions"("userId");
CREATE INDEX IF NOT EXISTS "idx_ai_suggestions_contact_id" ON "aiSuggestions"("contactId");
CREATE INDEX IF NOT EXISTS "idx_ai_suggestions_type" ON "aiSuggestions"("type");
CREATE INDEX IF NOT EXISTS "idx_ai_suggestions_priority" ON "aiSuggestions"("priority");
CREATE INDEX IF NOT EXISTS "idx_ai_suggestions_dismissed" ON "aiSuggestions"("dismissed");

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON "profiles"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON "contacts"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON "activities"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON "connections"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_preferences_updated_at
    BEFORE UPDATE ON "widgetPreferences"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_suggestions_updated_at
    BEFORE UPDATE ON "aiSuggestions"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "widgetPreferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aiSuggestions" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
    ON "profiles" FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON "profiles" FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own contacts"
    ON "contacts" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own contacts"
    ON "contacts" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own contacts"
    ON "contacts" FOR UPDATE
    USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own contacts"
    ON "contacts" FOR DELETE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can view their own activities"
    ON "activities" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own activities"
    ON "activities" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own activities"
    ON "activities" FOR UPDATE
    USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own activities"
    ON "activities" FOR DELETE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can view their own connections"
    ON "connections" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own connections"
    ON "connections" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own connections"
    ON "connections" FOR UPDATE
    USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own connections"
    ON "connections" FOR DELETE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can view their own widget preferences"
    ON "widgetPreferences" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own widget preferences"
    ON "widgetPreferences" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own widget preferences"
    ON "widgetPreferences" FOR UPDATE
    USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own widget preferences"
    ON "widgetPreferences" FOR DELETE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can view their own AI suggestions"
    ON "aiSuggestions" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own AI suggestions"
    ON "aiSuggestions" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own AI suggestions"
    ON "aiSuggestions" FOR UPDATE
    USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own AI suggestions"
    ON "aiSuggestions" FOR DELETE
    USING (auth.uid() = "userId");

-- Create function to automatically create activity records for AI suggestions
CREATE OR REPLACE FUNCTION create_ai_suggestion_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "activities" (
        "type",
        "title",
        "description",
        "metadata",
        "userId",
        "relatedId"
    ) VALUES (
        'ai_suggestion',
        NEW."title",
        NEW."description",
        jsonb_build_object(
            'suggestionType', NEW."type",
            'priority', NEW."priority",
            'contactId', NEW."contactId"
        ),
        NEW."userId",
        NEW."id"
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic activity creation
CREATE TRIGGER create_ai_suggestion_activity
    AFTER INSERT ON "aiSuggestions"
    FOR EACH ROW
    EXECUTE FUNCTION create_ai_suggestion_activity(); 