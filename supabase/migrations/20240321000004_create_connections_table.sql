-- Create connections table
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sourceContactId UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  targetContactId UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'colleague',
    'client',
    'partner',
    'vendor',
    'friend',
    'family',
    'other'
  )),
  strength INTEGER NOT NULL DEFAULT 1 CHECK (strength BETWEEN 1 AND 5),
  notes TEXT,
  metadata JSONB,
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(sourceContactId, targetContactId)
);

-- Create indexes for faster queries
CREATE INDEX connections_user_id_idx ON connections(userId);
CREATE INDEX connections_source_contact_id_idx ON connections(sourceContactId);
CREATE INDEX connections_target_contact_id_idx ON connections(targetContactId);
CREATE INDEX connections_type_idx ON connections(type);
CREATE INDEX connections_strength_idx ON connections(strength);

-- Create trigger for updatedAt
CREATE TRIGGER update_connections_updatedAt
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updatedAt_column();

-- Add RLS policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = userId)
  WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can delete their own connections"
  ON connections FOR DELETE
  USING (auth.uid() = userId);

-- Create function to automatically create activity records for connections
CREATE OR REPLACE FUNCTION create_connection_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (
    type,
    title,
    description,
    metadata,
    userId,
    relatedId
  ) VALUES (
    'contact_updated',
    (SELECT name FROM contacts WHERE id = NEW.sourceContactId),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Added connection to ' || (SELECT name FROM contacts WHERE id = NEW.targetContactId)
      WHEN TG_OP = 'UPDATE' THEN 'Updated connection with ' || (SELECT name FROM contacts WHERE id = NEW.targetContactId)
      WHEN TG_OP = 'DELETE' THEN 'Removed connection with ' || (SELECT name FROM contacts WHERE id = OLD.targetContactId)
    END,
    jsonb_build_object(
      'connectionType', NEW.type,
      'strength', NEW.strength,
      'sourceContactId', NEW.sourceContactId,
      'targetContactId', NEW.targetContactId
    ),
    NEW.userId,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic activity creation
CREATE TRIGGER create_connection_activity
  AFTER INSERT OR UPDATE OR DELETE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION create_connection_activity(); 