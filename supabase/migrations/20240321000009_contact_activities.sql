-- Create contact activities table
CREATE TABLE "contactActivities" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "contactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "relatedId" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX "idx_contact_activities_contact_id" ON "contactActivities"("contactId");
CREATE INDEX "idx_contact_activities_user_id" ON "contactActivities"("userId");
CREATE INDEX "idx_contact_activities_type" ON "contactActivities"("type");
CREATE INDEX "idx_contact_activities_created_at" ON "contactActivities"("createdAt" DESC);

-- Enable Row Level Security
ALTER TABLE "contactActivities" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact activities
CREATE POLICY "Users can view activities for their contacts"
    ON "contactActivities" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can create activities for their contacts"
    ON "contactActivities" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own activities"
    ON "contactActivities" FOR UPDATE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own activities"
    ON "contactActivities" FOR DELETE
    USING (auth.uid() = "userId");

-- Create function to automatically set userId
CREATE OR REPLACE FUNCTION set_contact_activity_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW."userId" = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set userId
CREATE TRIGGER set_contact_activity_user_id
    BEFORE INSERT ON "contactActivities"
    FOR EACH ROW
    EXECUTE FUNCTION set_contact_activity_user_id(); 