-- Create contact groups table
CREATE TABLE "contactGroups" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contact group members table
CREATE TABLE "contactGroupMembers" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "groupId" UUID NOT NULL REFERENCES "contactGroups"(id) ON DELETE CASCADE,
    "contactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    "addedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("groupId", "contactId")
);

-- Create contact tags table
CREATE TABLE "contactTags" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("userId", "name")
);

-- Create contact tag assignments table
CREATE TABLE "contactTagAssignments" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "tagId" UUID NOT NULL REFERENCES "contactTags"(id) ON DELETE CASCADE,
    "contactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("tagId", "contactId")
);

-- Create indexes for better query performance
CREATE INDEX "idx_contact_groups_user_id" ON "contactGroups"("userId");
CREATE INDEX "idx_contact_group_members_group_id" ON "contactGroupMembers"("groupId");
CREATE INDEX "idx_contact_group_members_contact_id" ON "contactGroupMembers"("contactId");
CREATE INDEX "idx_contact_tags_user_id" ON "contactTags"("userId");
CREATE INDEX "idx_contact_tag_assignments_tag_id" ON "contactTagAssignments"("tagId");
CREATE INDEX "idx_contact_tag_assignments_contact_id" ON "contactTagAssignments"("contactId");

-- Enable Row Level Security
ALTER TABLE "contactGroups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contactGroupMembers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contactTags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contactTagAssignments" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact groups
CREATE POLICY "Users can view their own contact groups"
    ON "contactGroups" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own contact groups"
    ON "contactGroups" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own contact groups"
    ON "contactGroups" FOR UPDATE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own contact groups"
    ON "contactGroups" FOR DELETE
    USING (auth.uid() = "userId");

-- Create RLS policies for contact group members
CREATE POLICY "Users can view their own contact group members"
    ON "contactGroupMembers" FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "contactGroups"
        WHERE "contactGroups".id = "contactGroupMembers"."groupId"
        AND "contactGroups"."userId" = auth.uid()
    ));

CREATE POLICY "Users can add members to their own groups"
    ON "contactGroupMembers" FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "contactGroups"
        WHERE "contactGroups".id = "contactGroupMembers"."groupId"
        AND "contactGroups"."userId" = auth.uid()
    ));

CREATE POLICY "Users can remove members from their own groups"
    ON "contactGroupMembers" FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM "contactGroups"
        WHERE "contactGroups".id = "contactGroupMembers"."groupId"
        AND "contactGroups"."userId" = auth.uid()
    ));

-- Create RLS policies for contact tags
CREATE POLICY "Users can view their own contact tags"
    ON "contactTags" FOR SELECT
    USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own contact tags"
    ON "contactTags" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own contact tags"
    ON "contactTags" FOR UPDATE
    USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own contact tags"
    ON "contactTags" FOR DELETE
    USING (auth.uid() = "userId");

-- Create RLS policies for contact tag assignments
CREATE POLICY "Users can view their own contact tag assignments"
    ON "contactTagAssignments" FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "contactTags"
        WHERE "contactTags".id = "contactTagAssignments"."tagId"
        AND "contactTags"."userId" = auth.uid()
    ));

CREATE POLICY "Users can assign their own tags"
    ON "contactTagAssignments" FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "contactTags"
        WHERE "contactTags".id = "contactTagAssignments"."tagId"
        AND "contactTags"."userId" = auth.uid()
    ));

CREATE POLICY "Users can remove their own tag assignments"
    ON "contactTagAssignments" FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM "contactTags"
        WHERE "contactTags".id = "contactTagAssignments"."tagId"
        AND "contactTags"."userId" = auth.uid()
    ));

-- Create triggers for updating timestamps
CREATE TRIGGER update_contact_groups_updated_at
    BEFORE UPDATE ON "contactGroups"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_tags_updated_at
    BEFORE UPDATE ON "contactTags"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 