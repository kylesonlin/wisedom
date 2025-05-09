-- Create user_two_factor table
CREATE TABLE IF NOT EXISTS user_two_factor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT,
  backup_codes TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_two_factor_user_id ON user_two_factor(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_two_factor_updated_at
  BEFORE UPDATE ON user_two_factor
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE user_two_factor ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own 2FA settings
CREATE POLICY "Users can view their own 2FA settings"
  ON user_two_factor
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own 2FA settings
CREATE POLICY "Users can update their own 2FA settings"
  ON user_two_factor
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to insert their own 2FA settings
CREATE POLICY "Users can insert their own 2FA settings"
  ON user_two_factor
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own 2FA settings
CREATE POLICY "Users can delete their own 2FA settings"
  ON user_two_factor
  FOR DELETE
  USING (auth.uid() = user_id); 