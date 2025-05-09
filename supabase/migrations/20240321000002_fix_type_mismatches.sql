-- Fix date type mismatches
ALTER TABLE "contacts" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ USING "createdAt"::TIMESTAMPTZ,
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ USING "updatedAt"::TIMESTAMPTZ,
  ALTER COLUMN "birthday" TYPE TIMESTAMPTZ USING "birthday"::TIMESTAMPTZ;

ALTER TABLE "activities" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ USING "createdAt"::TIMESTAMPTZ,
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ USING "updatedAt"::TIMESTAMPTZ,
  ALTER COLUMN "dueDate" TYPE TIMESTAMPTZ USING "dueDate"::TIMESTAMPTZ,
  ALTER COLUMN "completedAt" TYPE TIMESTAMPTZ USING "completedAt"::TIMESTAMPTZ;

ALTER TABLE "events" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ USING "createdAt"::TIMESTAMPTZ,
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ USING "updatedAt"::TIMESTAMPTZ,
  ALTER COLUMN "startDate" TYPE TIMESTAMPTZ USING "startDate"::TIMESTAMPTZ,
  ALTER COLUMN "endDate" TYPE TIMESTAMPTZ USING "endDate"::TIMESTAMPTZ;

ALTER TABLE "industryUpdates" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ USING "createdAt"::TIMESTAMPTZ,
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ USING "updatedAt"::TIMESTAMPTZ,
  ALTER COLUMN "publishedAt" TYPE TIMESTAMPTZ USING "publishedAt"::TIMESTAMPTZ;

-- Fix array type mismatches
ALTER TABLE "contacts" 
  ALTER COLUMN "tags" TYPE TEXT[] USING "tags"::TEXT[],
  ALTER COLUMN "additionalFields" TYPE JSONB USING "additionalFields"::JSONB;

ALTER TABLE "activities" 
  ALTER COLUMN "topics" TYPE TEXT[] USING "topics"::TEXT[],
  ALTER COLUMN "metadata" TYPE JSONB USING "metadata"::JSONB;

ALTER TABLE "events" 
  ALTER COLUMN "metadata" TYPE JSONB USING "metadata"::JSONB;

ALTER TABLE "industryUpdates" 
  ALTER COLUMN "metadata" TYPE JSONB USING "metadata"::JSONB;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS "idx_contacts_user_id" ON "contacts" ("userId");
CREATE INDEX IF NOT EXISTS "idx_contacts_updated_at" ON "contacts" ("updatedAt");
CREATE INDEX IF NOT EXISTS "idx_activities_user_id" ON "activities" ("userId");
CREATE INDEX IF NOT EXISTS "idx_activities_contact_id" ON "activities" ("contactId");
CREATE INDEX IF NOT EXISTS "idx_activities_created_at" ON "activities" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_events_user_id" ON "events" ("userId");
CREATE INDEX IF NOT EXISTS "idx_events_start_date" ON "events" ("startDate");
CREATE INDEX IF NOT EXISTS "idx_industry_updates_user_id" ON "industryUpdates" ("userId");
CREATE INDEX IF NOT EXISTS "idx_industry_updates_published_at" ON "industryUpdates" ("publishedAt");

-- Add RLS policies
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "industryUpdates" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own contacts"
  ON "contacts" FOR ALL
  USING (auth.uid() = "userId");

CREATE POLICY "Users can only access their own activities"
  ON "activities" FOR ALL
  USING (auth.uid() = "userId");

CREATE POLICY "Users can only access their own events"
  ON "events" FOR ALL
  USING (auth.uid() = "userId");

CREATE POLICY "Users can only access their own industry updates"
  ON "industryUpdates" FOR ALL
  USING (auth.uid() = "userId"); 