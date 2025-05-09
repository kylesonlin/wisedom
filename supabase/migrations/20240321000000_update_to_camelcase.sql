-- Update contacts table
ALTER TABLE contacts
  RENAME COLUMN first_name TO firstName;
ALTER TABLE contacts
  RENAME COLUMN last_name TO lastName;
ALTER TABLE contacts
  RENAME COLUMN additional_fields TO additionalFields;
ALTER TABLE contacts
  RENAME COLUMN created_at TO createdAt;
ALTER TABLE contacts
  RENAME COLUMN updated_at TO updatedAt;
ALTER TABLE contacts
  RENAME COLUMN user_id TO userId;

-- Update tasks table
ALTER TABLE tasks
  RENAME COLUMN due_date TO dueDate;
ALTER TABLE tasks
  RENAME COLUMN contact_id TO contactId;
ALTER TABLE tasks
  RENAME COLUMN project_id TO projectId;
ALTER TABLE tasks
  RENAME COLUMN created_at TO createdAt;
ALTER TABLE tasks
  RENAME COLUMN updated_at TO updatedAt;
ALTER TABLE tasks
  RENAME COLUMN user_id TO userId;

-- Update interactions table
ALTER TABLE interactions
  RENAME COLUMN contact_id TO contactId;
ALTER TABLE interactions
  RENAME COLUMN created_at TO createdAt;
ALTER TABLE interactions
  RENAME COLUMN updated_at TO updatedAt;

-- Update indexes
ALTER INDEX idx_tasks_due_date RENAME TO idx_tasks_dueDate;
ALTER INDEX idx_tasks_contact_id RENAME TO idx_tasks_contactId;
ALTER INDEX idx_interactions_contact_id RENAME TO idx_interactions_contactId;

-- Update saved_views table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_views') THEN
    ALTER TABLE saved_views
      RENAME COLUMN filter_options TO filterOptions;
    ALTER TABLE saved_views
      RENAME COLUMN sort_options TO sortOptions;
    ALTER TABLE saved_views
      RENAME COLUMN created_at TO createdAt;
  END IF;
END $$; 