-- Create interactions table
CREATE TABLE interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT,
  sentiment FLOAT CHECK (sentiment >= -1 AND sentiment <= 1),
  topics TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX idx_interactions_type ON interactions(type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own interactions"
  ON interactions FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM contact_shares 
    WHERE contact_id = interactions.contact_id
  ));

CREATE POLICY "Users can create interactions for their contacts"
  ON interactions FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM contact_shares 
    WHERE contact_id = interactions.contact_id
  ));

CREATE POLICY "Users can update their own interactions"
  ON interactions FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM contact_shares 
    WHERE contact_id = interactions.contact_id
  ));

CREATE POLICY "Users can delete their own interactions"
  ON interactions FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM contact_shares 
    WHERE contact_id = interactions.contact_id
  )); 