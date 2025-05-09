-- Add widget preferences table
CREATE TABLE "widgetPreferences" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "widgetId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", "widgetId")
);

-- Add saved views table
CREATE TABLE "savedViews" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ('contacts', 'projects', 'tasks')),
    "filterOptions" JSONB NOT NULL DEFAULT '{}',
    "sortOptions" JSONB NOT NULL DEFAULT '{}',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX "widgetPreferences_userId_idx" ON "widgetPreferences"("userId");
CREATE INDEX "widgetPreferences_widgetId_idx" ON "widgetPreferences"("widgetId");

CREATE INDEX "savedViews_userId_idx" ON "savedViews"("userId");
CREATE INDEX "savedViews_type_idx" ON "savedViews"("type");

-- Add updated_at triggers
CREATE TRIGGER update_widgetPreferences_updated_at
    BEFORE UPDATE ON "widgetPreferences"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savedViews_updated_at
    BEFORE UPDATE ON "savedViews"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "widgetPreferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "savedViews" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own widget preferences"
    ON "widgetPreferences" FOR SELECT
    USING ("userId" = auth.uid());

CREATE POLICY "Users can insert their own widget preferences"
    ON "widgetPreferences" FOR INSERT
    WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own widget preferences"
    ON "widgetPreferences" FOR UPDATE
    USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own widget preferences"
    ON "widgetPreferences" FOR DELETE
    USING ("userId" = auth.uid());

CREATE POLICY "Users can view their own saved views"
    ON "savedViews" FOR SELECT
    USING ("userId" = auth.uid());

CREATE POLICY "Users can insert their own saved views"
    ON "savedViews" FOR INSERT
    WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own saved views"
    ON "savedViews" FOR UPDATE
    USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own saved views"
    ON "savedViews" FOR DELETE
    USING ("userId" = auth.uid());

-- Add missing columns to contacts table
ALTER TABLE "contacts"
ADD COLUMN IF NOT EXISTS "avatar" TEXT,
ADD COLUMN IF NOT EXISTS "importance" INTEGER,
ADD COLUMN IF NOT EXISTS "urgency" INTEGER,
ADD COLUMN IF NOT EXISTS "assignedTo" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "relationshipStrength" INTEGER,
ADD COLUMN IF NOT EXISTS "tags" TEXT[],
ADD COLUMN IF NOT EXISTS "additionalFields" JSONB DEFAULT '{}';

-- Add missing columns to activities table
ALTER TABLE "activities"
ADD COLUMN IF NOT EXISTS "sentiment" INTEGER,
ADD COLUMN IF NOT EXISTS "topics" TEXT[],
ADD COLUMN IF NOT EXISTS "summary" TEXT;

-- Create function to update relationship strength
CREATE OR REPLACE FUNCTION update_relationship_strength()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate relationship strength based on interaction frequency and recency
    WITH interaction_stats AS (
        SELECT 
            "contactId",
            COUNT(*) as interaction_count,
            MAX("createdAt") as last_interaction,
            AVG("sentiment") as avg_sentiment
        FROM "activities"
        WHERE "contactId" = NEW."contactId"
        GROUP BY "contactId"
    )
    UPDATE "contacts"
    SET 
        "relationshipStrength" = (
            CASE 
                WHEN is.last_interaction IS NULL THEN 0
                ELSE 
                    LEAST(100, 
                        (is.interaction_count * 10) + 
                        (EXTRACT(EPOCH FROM (NOW() - is.last_interaction)) / 86400 * -1) +
                        (COALESCE(is.avg_sentiment, 0) * 20)
                    )
            END
        )
    FROM interaction_stats is
    WHERE "contacts"."id" = NEW."contactId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update relationship strength
CREATE TRIGGER update_contact_relationship_strength
    AFTER INSERT OR UPDATE ON "activities"
    FOR EACH ROW
    EXECUTE FUNCTION update_relationship_strength(); 