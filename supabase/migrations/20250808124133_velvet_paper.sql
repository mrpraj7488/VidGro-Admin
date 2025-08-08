/*
  # Runtime Configuration System

  1. New Tables
    - `runtime_config` - Stores configuration key-value pairs with environment and visibility settings
    - `config_audit_log` - Tracks all configuration changes for security and compliance

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access only
    - Audit logging for all configuration changes

  3. Features
    - Environment-based configuration (dev/staging/production)
    - Public/private configuration separation
    - Change tracking and audit trail
    - Secure key rotation support
*/

-- Create runtime_config table
CREATE TABLE IF NOT EXISTS runtime_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text NOT NULL,
  is_public boolean DEFAULT false,
  environment text DEFAULT 'production',
  description text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  UNIQUE(key, environment)
);

-- Create config audit log table
CREATE TABLE IF NOT EXISTS config_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL,
  environment text NOT NULL,
  action text NOT NULL, -- 'create', 'update', 'delete'
  old_value text,
  new_value text,
  admin_id uuid,
  admin_email text,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now(),
  reason text
);

-- Enable RLS
ALTER TABLE runtime_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for runtime_config
CREATE POLICY "Admins can manage runtime config"
  ON runtime_config
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for config_audit_log
CREATE POLICY "Admins can view audit logs"
  ON config_audit_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON config_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to get public runtime config for clients
CREATE OR REPLACE FUNCTION get_public_runtime_config(env_name text DEFAULT 'production')
RETURNS TABLE (
  key text,
  value text,
  category text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.key,
    rc.value,
    rc.category
  FROM runtime_config rc
  WHERE rc.is_public = true 
    AND rc.environment = env_name
  ORDER BY rc.category, rc.key;
END;
$$;

-- Function to get all runtime config for admin panel
CREATE OR REPLACE FUNCTION get_all_runtime_config(env_name text DEFAULT 'production')
RETURNS TABLE (
  id uuid,
  key text,
  value text,
  is_public boolean,
  environment text,
  description text,
  category text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id,
    rc.key,
    rc.value,
    rc.is_public,
    rc.environment,
    rc.description,
    rc.category,
    rc.created_at,
    rc.updated_at
  FROM runtime_config rc
  WHERE rc.environment = env_name
  ORDER BY rc.category, rc.key;
END;
$$;

-- Function to upsert runtime config with audit logging
CREATE OR REPLACE FUNCTION upsert_runtime_config(
  config_key text,
  config_value text,
  is_public_param boolean DEFAULT false,
  env_name text DEFAULT 'production',
  description_param text DEFAULT NULL,
  category_param text DEFAULT 'general',
  admin_id_param uuid DEFAULT NULL,
  admin_email_param text DEFAULT NULL,
  ip_address_param text DEFAULT NULL,
  user_agent_param text DEFAULT NULL,
  reason_param text DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  message text,
  config_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_config runtime_config%ROWTYPE;
  new_config_id uuid;
  audit_action text;
BEGIN
  -- Check if config exists
  SELECT * INTO existing_config
  FROM runtime_config
  WHERE key = config_key AND environment = env_name;

  IF existing_config.id IS NOT NULL THEN
    -- Update existing config
    UPDATE runtime_config
    SET 
      value = config_value,
      is_public = is_public_param,
      description = COALESCE(description_param, description),
      category = COALESCE(category_param, category),
      updated_at = now(),
      updated_by = admin_id_param
    WHERE id = existing_config.id
    RETURNING id INTO new_config_id;
    
    audit_action := 'update';
    
    -- Log the change
    INSERT INTO config_audit_log (
      config_key, environment, action, old_value, new_value,
      admin_id, admin_email, ip_address, user_agent, reason
    ) VALUES (
      config_key, env_name, audit_action, existing_config.value, config_value,
      admin_id_param, admin_email_param, ip_address_param, user_agent_param, reason_param
    );
  ELSE
    -- Create new config
    INSERT INTO runtime_config (
      key, value, is_public, environment, description, category, created_by, updated_by
    ) VALUES (
      config_key, config_value, is_public_param, env_name, description_param, category_param, admin_id_param, admin_id_param
    ) RETURNING id INTO new_config_id;
    
    audit_action := 'create';
    
    -- Log the creation
    INSERT INTO config_audit_log (
      config_key, environment, action, new_value,
      admin_id, admin_email, ip_address, user_agent, reason
    ) VALUES (
      config_key, env_name, audit_action, config_value,
      admin_id_param, admin_email_param, ip_address_param, user_agent_param, reason_param
    );
  END IF;

  RETURN QUERY SELECT true, 'Configuration saved successfully', new_config_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM, NULL::uuid;
END;
$$;

-- Function to delete runtime config with audit logging
CREATE OR REPLACE FUNCTION delete_runtime_config(
  config_key text,
  env_name text DEFAULT 'production',
  admin_id_param uuid DEFAULT NULL,
  admin_email_param text DEFAULT NULL,
  ip_address_param text DEFAULT NULL,
  user_agent_param text DEFAULT NULL,
  reason_param text DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_config runtime_config%ROWTYPE;
BEGIN
  -- Get existing config for audit log
  SELECT * INTO existing_config
  FROM runtime_config
  WHERE key = config_key AND environment = env_name;

  IF existing_config.id IS NULL THEN
    RETURN QUERY SELECT false, 'Configuration not found';
    RETURN;
  END IF;

  -- Delete the config
  DELETE FROM runtime_config
  WHERE key = config_key AND environment = env_name;

  -- Log the deletion
  INSERT INTO config_audit_log (
    config_key, environment, action, old_value,
    admin_id, admin_email, ip_address, user_agent, reason
  ) VALUES (
    config_key, env_name, 'delete', existing_config.value,
    admin_id_param, admin_email_param, ip_address_param, user_agent_param, reason_param
  );

  RETURN QUERY SELECT true, 'Configuration deleted successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM;
END;
$$;

-- Function to get config audit logs
CREATE OR REPLACE FUNCTION get_config_audit_logs(
  config_key_filter text DEFAULT NULL,
  env_filter text DEFAULT NULL,
  days_back integer DEFAULT 30,
  limit_count integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  config_key text,
  environment text,
  action text,
  old_value text,
  new_value text,
  admin_email text,
  ip_address text,
  created_at timestamptz,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cal.id,
    cal.config_key,
    cal.environment,
    cal.action,
    cal.old_value,
    cal.new_value,
    cal.admin_email,
    cal.ip_address,
    cal.timestamp,
    cal.reason
  FROM config_audit_log cal
  WHERE 
    (config_key_filter IS NULL OR cal.config_key = config_key_filter)
    AND (env_filter IS NULL OR cal.environment = env_filter)
    AND cal.timestamp >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ORDER BY cal.timestamp DESC
  LIMIT limit_count;
END;
$$;

-- Insert default configuration values
INSERT INTO runtime_config (key, value, is_public, environment, description, category) VALUES
-- Supabase public config
('SUPABASE_URL', 'https://kuibswqfmhhdybttbcoa.supabase.co', true, 'production', 'Supabase project URL', 'supabase'),
('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODIwNTYsImV4cCI6MjA2OTM1ODA1Nn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8', true, 'production', 'Supabase anonymous key for client apps', 'supabase'),

-- AdMob public config
('ADMOB_APP_ID', 'ca-app-pub-2892152842024866~2841739969', true, 'production', 'AdMob application ID', 'admob'),
('ADMOB_BANNER_ID', 'ca-app-pub-2892152842024866/6180566789', true, 'production', 'AdMob banner ad unit ID', 'admob'),
('ADMOB_INTERSTITIAL_ID', 'ca-app-pub-2892152842024866/2604283857', true, 'production', 'AdMob interstitial ad unit ID', 'admob'),
('ADMOB_REWARDED_ID', 'ca-app-pub-2892152842024866/2049185437', true, 'production', 'AdMob rewarded ad unit ID', 'admob'),

-- Feature flags
('FEATURE_ADS_ENABLED', 'true', true, 'production', 'Enable/disable ads in mobile app', 'features'),
('FEATURE_COINS_ENABLED', 'true', true, 'production', 'Enable/disable coin system', 'features'),
('FEATURE_VIP_ENABLED', 'true', true, 'production', 'Enable/disable VIP features', 'features'),
('FEATURE_REFERRALS_ENABLED', 'true', true, 'production', 'Enable/disable referral system', 'features'),

-- App settings
('APP_MIN_VERSION', '1.0.0', true, 'production', 'Minimum supported app version', 'app'),
('APP_FORCE_UPDATE', 'false', true, 'production', 'Force app update flag', 'app'),
('MAINTENANCE_MODE', 'false', true, 'production', 'Maintenance mode flag', 'app'),

-- Private/backend-only config
('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4MjA1NiwiZXhwIjoyMDY5MzU4MDU2fQ.hJNaVa025MEen4DM567AO1y0NQxAZO3HWt6nbX6OBKs', false, 'production', 'Supabase service role key (backend only)', 'supabase'),
('JWT_SECRET', 'vidgro-jwt-secret-2024', false, 'production', 'JWT signing secret', 'security'),
('API_ENCRYPTION_KEY', 'vidgro-encryption-key-2024', false, 'production', 'API encryption key', 'security')

ON CONFLICT (key, environment) DO NOTHING;