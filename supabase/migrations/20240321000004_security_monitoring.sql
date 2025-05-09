-- Create security events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('login', 'logout', 'password_change', 'permission_change')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB NOT NULL DEFAULT '{}',
  ip TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Create security alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES security_events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('suspicious_activity', 'failed_login', 'rate_limit', 'permission_change')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'investigating')),
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'resolved', 'investigating'))
);

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Create indexes for security alerts
CREATE INDEX IF NOT EXISTS idx_security_alerts_event_id ON security_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);

-- Create RLS policies for security events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security events"
  ON security_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert security events"
  ON security_events
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for security alerts
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security alerts"
  ON security_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM security_events
      WHERE security_events.id = security_alerts.event_id
      AND security_events.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert security alerts"
  ON security_alerts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update security alerts"
  ON security_alerts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update resolved_at
CREATE OR REPLACE FUNCTION update_security_alert_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_alert_resolved_at
  BEFORE UPDATE ON security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_security_alert_resolved_at(); 