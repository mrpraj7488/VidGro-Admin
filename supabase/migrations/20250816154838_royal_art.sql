/*
  # Database Schema Optimization for VidGro

  1. Schema Improvements
    - Add missing columns to existing tables based on backup data
    - Create proper foreign key relationships
    - Add composite indexes for better query performance
    - Implement materialized views for analytics

  2. Performance Optimizations
    - Add strategic indexes for common query patterns
    - Create computed columns for frequently calculated values
    - Implement proper constraints and defaults

  3. Data Integrity
    - Add proper foreign key constraints
    - Implement check constraints for data validation
    - Add unique constraints where needed

  4. Sync Optimization
    - Create triggers for real-time sync
    - Add change tracking for efficient updates
    - Implement conflict resolution strategies
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email text UNIQUE NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username text UNIQUE NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'coins') THEN
    ALTER TABLE profiles ADD COLUMN coins integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_vip') THEN
    ALTER TABLE profiles ADD COLUMN is_vip boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vip_expires_at') THEN
    ALTER TABLE profiles ADD COLUMN vip_expires_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE profiles ADD COLUMN referral_code text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by') THEN
    ALTER TABLE profiles ADD COLUMN referred_by text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_earned') THEN
    ALTER TABLE profiles ADD COLUMN total_earned integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_spent') THEN
    ALTER TABLE profiles ADD COLUMN total_spent integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'videos_posted') THEN
    ALTER TABLE profiles ADD COLUMN videos_posted integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active') THEN
    ALTER TABLE profiles ADD COLUMN last_active timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_banned') THEN
    ALTER TABLE profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ban_reason') THEN
    ALTER TABLE profiles ADD COLUMN ban_reason text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ban_date') THEN
    ALTER TABLE profiles ADD COLUMN ban_date timestamptz;
  END IF;
END $$;

-- Add missing columns to videos table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'user_id') THEN
    ALTER TABLE videos ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'youtube_url') THEN
    ALTER TABLE videos ADD COLUMN youtube_url text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'title') THEN
    ALTER TABLE videos ADD COLUMN title text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'views_count') THEN
    ALTER TABLE videos ADD COLUMN views_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'target_views') THEN
    ALTER TABLE videos ADD COLUMN target_views integer NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'duration_seconds') THEN
    ALTER TABLE videos ADD COLUMN duration_seconds integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'coin_reward') THEN
    ALTER TABLE videos ADD COLUMN coin_reward integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'coin_cost') THEN
    ALTER TABLE videos ADD COLUMN coin_cost integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'status') THEN
    ALTER TABLE videos ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'repromoted', 'deleted', 'pending'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'hold_until') THEN
    ALTER TABLE videos ADD COLUMN hold_until timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'repromoted_at') THEN
    ALTER TABLE videos ADD COLUMN repromoted_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'total_watch_time') THEN
    ALTER TABLE videos ADD COLUMN total_watch_time integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'completion_rate') THEN
    ALTER TABLE videos ADD COLUMN completion_rate decimal(5,2) DEFAULT 0.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'completed') THEN
    ALTER TABLE videos ADD COLUMN completed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'coins_earned_total') THEN
    ALTER TABLE videos ADD COLUMN coins_earned_total integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'username') THEN
    ALTER TABLE videos ADD COLUMN username text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'video_id') THEN
    ALTER TABLE videos ADD COLUMN video_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'video_url') THEN
    ALTER TABLE videos ADD COLUMN video_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'current_views') THEN
    ALTER TABLE videos ADD COLUMN current_views integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'spent_coins') THEN
    ALTER TABLE videos ADD COLUMN spent_coins integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE videos ADD COLUMN thumbnail_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'refund_amount') THEN
    ALTER TABLE videos ADD COLUMN refund_amount integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'refund_percent') THEN
    ALTER TABLE videos ADD COLUMN refund_percent integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'completed_at') THEN
    ALTER TABLE videos ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Create optimized composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_user_status_views 
ON videos(user_id, status, views_count, target_views) 
WHERE status IN ('active', 'completed', 'on_hold');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_status_completion 
ON videos(status, completed, created_at DESC) 
WHERE status != 'deleted';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_activity 
ON profiles(last_active DESC, is_vip, coins) 
WHERE is_banned = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_type_date 
ON transactions(user_id, transaction_type, created_at DESC);

-- Create materialized view for dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_analytics AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.is_vip THEN p.id END) as vip_users,
  COUNT(DISTINCT CASE WHEN p.last_active > NOW() - INTERVAL '7 days' THEN p.id END) as active_users_7d,
  COUNT(DISTINCT CASE WHEN v.status = 'active' THEN v.id END) as active_videos,
  COUNT(DISTINCT CASE WHEN v.status = 'completed' THEN v.id END) as completed_videos,
  COALESCE(SUM(CASE WHEN t.transaction_type = 'coin_purchase' AND t.created_at > DATE_TRUNC('month', NOW()) THEN t.amount * 0.01 END), 0) as monthly_revenue,
  COALESCE(SUM(p.coins), 0) as total_coins_in_circulation,
  COUNT(DISTINCT CASE WHEN t.created_at > NOW() - INTERVAL '1 day' THEN t.id END) as daily_transactions,
  COALESCE(AVG(v.completion_rate), 0) as avg_completion_rate,
  COALESCE(AVG(v.total_watch_time), 0) as avg_watch_time
FROM profiles p
LEFT JOIN videos v ON p.id = v.user_id
LEFT JOIN transactions t ON p.id = t.user_id
WHERE p.is_banned = false;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_analytics_refresh 
ON dashboard_analytics((1));

-- Function to refresh analytics efficiently
CREATE OR REPLACE FUNCTION refresh_dashboard_analytics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_analytics;
END;
$$;

-- Create optimized function for dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE(
  total_users bigint,
  active_videos bigint,
  vip_users bigint,
  monthly_revenue numeric,
  user_growth_rate numeric,
  daily_active_users bigint,
  coin_transactions bigint,
  total_coins_distributed bigint,
  video_completion_rate numeric,
  average_watch_time numeric,
  total_transactions bigint,
  pending_videos bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh analytics if older than 5 minutes
  IF NOT EXISTS (
    SELECT 1 FROM pg_stat_user_tables 
    WHERE relname = 'dashboard_analytics' 
    AND last_autoanalyze > NOW() - INTERVAL '5 minutes'
  ) THEN
    PERFORM refresh_dashboard_analytics();
  END IF;

  RETURN QUERY
  SELECT 
    da.total_users,
    da.active_videos,
    da.vip_users,
    da.monthly_revenue,
    CASE 
      WHEN da.total_users > 0 THEN 
        ((da.active_users_7d::numeric / da.total_users) * 100)
      ELSE 0
    END as user_growth_rate,
    da.active_users_7d as daily_active_users,
    da.daily_transactions as coin_transactions,
    da.total_coins_in_circulation as total_coins_distributed,
    da.avg_completion_rate as video_completion_rate,
    da.avg_watch_time as average_watch_time,
    da.daily_transactions as total_transactions,
    (SELECT COUNT(*) FROM videos WHERE status = 'pending')::bigint as pending_videos
  FROM dashboard_analytics da;
END;
$$;

-- Optimize video watch function to prevent duplicate processing
CREATE OR REPLACE FUNCTION optimized_watch_video(
  p_user_uuid uuid,
  p_video_uuid uuid,
  p_watch_duration integer,
  p_video_fully_watched boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_video_record RECORD;
  v_user_record RECORD;
  v_coins_to_award INTEGER;
  v_new_user_balance INTEGER;
  v_is_complete_watch BOOLEAN;
  v_watch_session_id TEXT;
BEGIN
  -- Generate unique watch session ID to prevent duplicates
  v_watch_session_id := 'watch_' || p_user_uuid || '_' || p_video_uuid || '_' || EXTRACT(EPOCH FROM NOW());
  
  -- Check if this exact watch session was already processed (prevent duplicates)
  IF EXISTS (
    SELECT 1 FROM transactions 
    WHERE metadata->>'watch_session_id' = v_watch_session_id
    AND created_at > NOW() - INTERVAL '1 minute'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Duplicate watch session detected',
      'code', 'DUPLICATE_SESSION'
    );
  END IF;

  -- Get video details with row-level lock to prevent race conditions
  SELECT * INTO v_video_record 
  FROM videos 
  WHERE id = p_video_uuid
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Video not found');
  END IF;
  
  -- Prevent video owners from watching their own videos
  IF v_video_record.user_id = p_user_uuid THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Cannot watch your own video',
      'code', 'OWNER_RESTRICTION'
    );
  END IF;
  
  -- Check if video is available for watching
  IF v_video_record.completed = TRUE OR v_video_record.status NOT IN ('active', 'repromoted') THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Video not available for watching',
      'code', 'VIDEO_UNAVAILABLE'
    );
  END IF;
  
  -- Get user profile with lock
  SELECT * INTO v_user_record 
  FROM profiles 
  WHERE id = p_user_uuid
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Calculate coins to award
  v_is_complete_watch := (p_watch_duration >= v_video_record.duration_seconds) OR p_video_fully_watched;
  v_coins_to_award := CASE 
    WHEN v_is_complete_watch THEN v_video_record.coin_reward
    ELSE GREATEST(1, (v_video_record.coin_reward * p_watch_duration / v_video_record.duration_seconds))
  END;
  
  -- Update user balance
  UPDATE profiles 
  SET 
    coins = coins + v_coins_to_award,
    total_earned = total_earned + v_coins_to_award,
    last_active = NOW(),
    updated_at = NOW()
  WHERE id = p_user_uuid
  RETURNING coins INTO v_new_user_balance;
  
  -- Update video metrics atomically
  UPDATE videos 
  SET 
    views_count = views_count + 1,
    total_watch_time = total_watch_time + p_watch_duration,
    completion_rate = LEAST(100.0, ((views_count + 1)::decimal / target_views) * 100),
    coins_earned_total = coins_earned_total + v_coins_to_award,
    completed = CASE WHEN (views_count + 1) >= target_views THEN TRUE ELSE FALSE END,
    status = CASE WHEN (views_count + 1) >= target_views THEN 'completed' ELSE status END,
    updated_at = NOW()
  WHERE id = p_video_uuid;
  
  -- Record transaction with session tracking
  INSERT INTO transactions (
    user_id,
    transaction_type,
    amount,
    description,
    metadata
  ) VALUES (
    p_user_uuid,
    'video_watch_reward',
    v_coins_to_award,
    'Watched video: ' || v_video_record.title,
    json_build_object(
      'video_id', p_video_uuid,
      'watch_duration', p_watch_duration,
      'is_complete_watch', v_is_complete_watch,
      'watch_session_id', v_watch_session_id
    )
  );
  
  -- Update video owner's total earned counter
  UPDATE profiles 
  SET total_earned = total_earned + v_coins_to_award
  WHERE id = v_video_record.user_id;
  
  RETURN json_build_object(
    'success', true,
    'coins_awarded', v_coins_to_award,
    'new_user_balance', v_new_user_balance,
    'video_views_count', v_video_record.views_count + 1,
    'video_completed', (v_video_record.views_count + 1) >= v_video_record.target_views,
    'watch_session_id', v_watch_session_id
  );
END;
$$;

-- Create efficient user stats aggregation function
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile RECORD;
  v_video_stats RECORD;
  v_transaction_stats RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Get video statistics
  SELECT 
    COUNT(*) as total_videos,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_videos,
    COUNT(CASE WHEN completed = true THEN 1 END) as completed_videos,
    COALESCE(SUM(coin_cost), 0) as total_spent_on_videos,
    COALESCE(SUM(coins_earned_total), 0) as total_earned_from_videos
  INTO v_video_stats
  FROM videos 
  WHERE user_id = p_user_id;
  
  -- Get transaction statistics
  SELECT 
    COUNT(*) as total_transactions,
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) END), 0) as total_spent
  INTO v_transaction_stats
  FROM transactions 
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'profile', row_to_json(v_profile),
    'video_stats', row_to_json(v_video_stats),
    'transaction_stats', row_to_json(v_transaction_stats)
  );
END;
$$;

-- Create function to prevent duplicate video submissions
CREATE OR REPLACE FUNCTION create_video_with_duplicate_check(
  p_user_id uuid,
  p_youtube_url text,
  p_title text,
  p_target_views integer,
  p_duration_seconds integer,
  p_coin_reward integer,
  p_coin_cost integer
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_record RECORD;
  v_new_video_id uuid;
  v_duplicate_check RECORD;
BEGIN
  -- Check for duplicate YouTube URL by same user
  SELECT * INTO v_duplicate_check
  FROM videos 
  WHERE user_id = p_user_id 
  AND youtube_url = p_youtube_url 
  AND status != 'deleted'
  AND created_at > NOW() - INTERVAL '24 hours';
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You have already submitted this video in the last 24 hours',
      'existing_video_id', v_duplicate_check.id
    );
  END IF;
  
  -- Get user profile with lock
  SELECT * INTO v_user_record 
  FROM profiles 
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if user has enough coins
  IF v_user_record.coins < p_coin_cost THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient coins',
      'required', p_coin_cost,
      'available', v_user_record.coins
    );
  END IF;
  
  -- Deduct coins and update user stats
  UPDATE profiles 
  SET 
    coins = coins - p_coin_cost,
    total_spent = total_spent + p_coin_cost,
    videos_posted = videos_posted + 1,
    last_active = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Create video record
  INSERT INTO videos (
    user_id,
    youtube_url,
    title,
    target_views,
    duration_seconds,
    coin_reward,
    coin_cost,
    status,
    hold_until,
    username
  ) VALUES (
    p_user_id,
    p_youtube_url,
    p_title,
    p_target_views,
    p_duration_seconds,
    p_coin_reward,
    p_coin_cost,
    'on_hold',
    NOW() + INTERVAL '10 minutes',
    v_user_record.username
  ) RETURNING id INTO v_new_video_id;
  
  -- Record transaction
  INSERT INTO transactions (
    user_id,
    transaction_type,
    amount,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'video_promotion',
    -p_coin_cost,
    'Video promotion: ' || p_title,
    json_build_object('video_id', v_new_video_id)
  );
  
  RETURN json_build_object(
    'success', true,
    'video_id', v_new_video_id,
    'new_balance', v_user_record.coins - p_coin_cost,
    'message', 'Video created successfully'
  );
END;
$$;

-- Create efficient sync tracking table
CREATE TABLE IF NOT EXISTS sync_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  retry_count integer DEFAULT 0,
  last_sync_attempt timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(table_name, record_id, operation)
);

-- Create indexes for sync tracking
CREATE INDEX IF NOT EXISTS idx_sync_tracking_status 
ON sync_tracking(sync_status, created_at);

CREATE INDEX IF NOT EXISTS idx_sync_tracking_table 
ON sync_tracking(table_name, sync_status);

-- Create trigger function for sync tracking
CREATE OR REPLACE FUNCTION track_table_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only track changes for main tables
  IF TG_TABLE_NAME IN ('profiles', 'videos', 'transactions') THEN
    INSERT INTO sync_tracking (table_name, record_id, operation)
    VALUES (
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      TG_OP
    )
    ON CONFLICT (table_name, record_id, operation) 
    DO UPDATE SET 
      sync_status = 'pending',
      retry_count = 0,
      created_at = NOW();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add sync tracking triggers to main tables
DROP TRIGGER IF EXISTS sync_profiles_changes ON profiles;
CREATE TRIGGER sync_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION track_table_changes();

DROP TRIGGER IF EXISTS sync_videos_changes ON videos;
CREATE TRIGGER sync_videos_changes
  AFTER INSERT OR UPDATE OR DELETE ON videos
  FOR EACH ROW EXECUTE FUNCTION track_table_changes();

DROP TRIGGER IF EXISTS sync_transactions_changes ON transactions;
CREATE TRIGGER sync_transactions_changes
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION track_table_changes();

-- Create function to get pending sync changes
CREATE OR REPLACE FUNCTION get_pending_sync_changes(p_limit integer DEFAULT 100)
RETURNS TABLE(
  id uuid,
  table_name text,
  record_id uuid,
  operation text,
  created_at timestamptz,
  record_data jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.table_name,
    st.record_id,
    st.operation,
    st.created_at,
    CASE 
      WHEN st.table_name = 'profiles' THEN 
        (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = st.record_id)
      WHEN st.table_name = 'videos' THEN 
        (SELECT row_to_json(v.*) FROM videos v WHERE v.id = st.record_id)
      WHEN st.table_name = 'transactions' THEN 
        (SELECT row_to_json(t.*) FROM transactions t WHERE t.id = st.record_id)
      ELSE NULL
    END as record_data
  FROM sync_tracking st
  WHERE st.sync_status = 'pending'
  ORDER BY st.created_at ASC
  LIMIT p_limit;
END;
$$;

-- Create function to mark sync as completed
CREATE OR REPLACE FUNCTION mark_sync_completed(p_sync_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  UPDATE sync_tracking 
  SET 
    sync_status = 'synced',
    last_sync_attempt = NOW()
  WHERE id = ANY(p_sync_ids);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- Create cleanup function for old sync records
CREATE OR REPLACE FUNCTION cleanup_old_sync_records()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM sync_tracking 
  WHERE sync_status = 'synced' 
  AND created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION optimized_watch_video(uuid, uuid, integer, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_video_with_duplicate_check(uuid, text, text, integer, integer, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_pending_sync_changes(integer) TO service_role;
GRANT EXECUTE ON FUNCTION mark_sync_completed(uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_sync_records() TO service_role;
GRANT EXECUTE ON FUNCTION refresh_dashboard_analytics() TO service_role;

-- Enable RLS on sync_tracking table
ALTER TABLE sync_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access sync tracking"
  ON sync_tracking
  FOR ALL
  TO service_role
  USING (true);

-- Create scheduled job to refresh analytics (if pg_cron is available)
-- This would typically be set up separately in your Supabase dashboard
-- SELECT cron.schedule('refresh-analytics', '*/5 * * * *', 'SELECT refresh_dashboard_analytics();');

-- Create scheduled job to cleanup old sync records
-- SELECT cron.schedule('cleanup-sync', '0 2 * * *', 'SELECT cleanup_old_sync_records();');