/*
  # Create security events table

  1. New Tables
    - `security_events`
      - `id` (uuid, primary key)
      - `type` (text, event type)
      - `severity` (text, severity level)
      - `description` (text, event description)
      - `timestamp` (timestamp with timezone)
      - `admin_email` (text, optional)
      - `ip_address` (text, optional)
      - `resolved` (boolean, default false)
      - `metadata` (jsonb, additional event data)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `security_events` table
    - Add policy for service role to access all events
*/

CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('key_rotation', 'config_change', 'access_attempt', 'permission_change', 'login_failure', 'suspicious_activity')),
    severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description text NOT NULL,
    timestamp timestamptz DEFAULT now(),
    admin_email text,
    ip_address text,
    resolved boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Policy for service role to access all events (for admin panel)
CREATE POLICY "Service role can access all security events"
    ON public.security_events
    FOR ALL
    TO service_role
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON public.security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON public.security_events(resolved);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_security_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_security_events_updated_at();

-- Insert some sample security events for testing
INSERT INTO public.security_events (type, severity, description, admin_email, ip_address) VALUES
('config_change', 'medium', 'Runtime configuration updated', 'admin@vidgro.com', '127.0.0.1'),
('key_rotation', 'high', 'API key rotation completed', 'admin@vidgro.com', '127.0.0.1'),
('access_attempt', 'low', 'Admin panel access', 'admin@vidgro.com', '127.0.0.1'),
('login_failure', 'medium', 'Failed login attempt detected', null, '192.168.1.100'),
('suspicious_activity', 'high', 'Multiple failed authentication attempts', null, '192.168.1.100');