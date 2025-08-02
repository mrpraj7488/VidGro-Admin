/*
  # Fix Admin Dashboard Functions

  This migration fixes the database functions that are failing due to:
  1. Missing coin_transactions table reference
  2. Type mismatch in user growth analytics

  ## Changes Made
  1. Update get_admin_dashboard_stats to use existing tables instead of coin_transactions
  2. Fix get_user_growth_analytics to return proper date type
  3. Create missing functions if they don't exist
*/

-- Fix get_admin_dashboard_stats function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
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
  RETURN QUERY
  SELECT 
    -- Total users
    (SELECT COUNT(*) FROM profiles)::bigint as total_users,
    
    -- Active videos
    (SELECT COUNT(*) FROM videos WHERE status = 'active')::bigint as active_videos,
    
    -- VIP users
    (SELECT COUNT(*) FROM profiles WHERE is_vip = true)::bigint as vip_users,
    
    -- Monthly revenue (estimated from coin costs in current month)
    (SELECT COALESCE(SUM(coin_cost * 0.01), 0) 
     FROM videos 
     WHERE created_at >= date_trunc('month', CURRENT_DATE))::numeric as monthly_revenue,
    
    -- User growth rate (last 30 days vs previous 30 days)
    (SELECT 
      CASE 
        WHEN prev_count > 0 THEN 
          ((curr_count - prev_count)::numeric / prev_count::numeric * 100)
        ELSE 0 
      END
     FROM (
       SELECT 
         (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as curr_count,
         (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '60 days' AND created_at < CURRENT_DATE - INTERVAL '30 days') as prev_count
     ) growth_calc)::numeric as user_growth_rate,
    
    -- Daily active users (users with activity in last 24 hours - using updated_at as proxy)
    (SELECT COUNT(*) FROM profiles WHERE updated_at >= CURRENT_DATE - INTERVAL '1 day')::bigint as daily_active_users,
    
    -- Coin transactions (total videos created as proxy for transactions)
    (SELECT COUNT(*) FROM videos)::bigint as coin_transactions,
    
    -- Total coins distributed (sum of all coin rewards earned)
    (SELECT COALESCE(SUM(coins_earned_total), 0) FROM videos)::bigint as total_coins_distributed,
    
    -- Video completion rate
    (SELECT 
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE completed = true)::numeric / COUNT(*)::numeric * 100)
        ELSE 0 
      END
     FROM videos)::numeric as video_completion_rate,
    
    -- Average watch time
    (SELECT COALESCE(AVG(total_watch_time), 0) FROM videos WHERE total_watch_time > 0)::numeric as average_watch_time,
    
    -- Total transactions (using video deletions + videos as proxy)
    (SELECT (SELECT COUNT(*) FROM videos) + (SELECT COUNT(*) FROM video_deletions))::bigint as total_transactions,
    
    -- Pending videos
    (SELECT COUNT(*) FROM videos WHERE status = 'on_hold')::bigint as pending_videos;
END;
$$;

-- Fix get_user_growth_analytics function
CREATE OR REPLACE FUNCTION get_user_growth_analytics(days_back integer DEFAULT 30)
RETURNS TABLE (
  date date,
  new_users bigint,
  active_users bigint,
  total_users bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::date as date
  ),
  daily_stats AS (
    SELECT 
      ds.date,
      COALESCE(new_users.count, 0) as new_users,
      COALESCE(active_users.count, 0) as active_users,
      COALESCE(total_users.count, 0) as total_users
    FROM date_series ds
    LEFT JOIN (
      SELECT 
        created_at::date as date,
        COUNT(*) as count
      FROM profiles 
      WHERE created_at::date >= CURRENT_DATE - days_back
      GROUP BY created_at::date
    ) new_users ON ds.date = new_users.date
    LEFT JOIN (
      SELECT 
        updated_at::date as date,
        COUNT(*) as count
      FROM profiles 
      WHERE updated_at::date >= CURRENT_DATE - days_back
      GROUP BY updated_at::date
    ) active_users ON ds.date = active_users.date
    LEFT JOIN (
      SELECT 
        ds2.date,
        COUNT(p.*) as count
      FROM date_series ds2
      LEFT JOIN profiles p ON p.created_at::date <= ds2.date
      GROUP BY ds2.date
    ) total_users ON ds.date = total_users.date
  )
  SELECT 
    daily_stats.date,
    daily_stats.new_users,
    daily_stats.active_users,
    daily_stats.total_users
  FROM daily_stats
  ORDER BY daily_stats.date;
END;
$$;

-- Create get_video_performance_analytics function if it doesn't exist
CREATE OR REPLACE FUNCTION get_video_performance_analytics(days_back integer DEFAULT 30)
RETURNS TABLE (
  date date,
  videos_created bigint,
  videos_completed bigint,
  total_views bigint,
  completion_rate numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::date as date
  )
  SELECT 
    ds.date,
    COALESCE(created.count, 0) as videos_created,
    COALESCE(completed.count, 0) as videos_completed,
    COALESCE(views.total, 0) as total_views,
    CASE 
      WHEN COALESCE(created.count, 0) > 0 THEN 
        (COALESCE(completed.count, 0)::numeric / created.count::numeric * 100)
      ELSE 0 
    END as completion_rate
  FROM date_series ds
  LEFT JOIN (
    SELECT 
      created_at::date as date,
      COUNT(*) as count
    FROM videos 
    WHERE created_at::date >= CURRENT_DATE - days_back
    GROUP BY created_at::date
  ) created ON ds.date = created.date
  LEFT JOIN (
    SELECT 
      updated_at::date as date,
      COUNT(*) as count
    FROM videos 
    WHERE completed = true AND updated_at::date >= CURRENT_DATE - days_back
    GROUP BY updated_at::date
  ) completed ON ds.date = completed.date
  LEFT JOIN (
    SELECT 
      created_at::date as date,
      SUM(views_count) as total
    FROM videos 
    WHERE created_at::date >= CURRENT_DATE - days_back
    GROUP BY created_at::date
  ) views ON ds.date = views.date
  ORDER BY ds.date;
END;
$$;

-- Create get_coin_economy_analytics function if it doesn't exist
CREATE OR REPLACE FUNCTION get_coin_economy_analytics(days_back integer DEFAULT 30)
RETURNS TABLE (
  date date,
  coins_spent bigint,
  coins_earned bigint,
  net_flow bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::date as date
  )
  SELECT 
    ds.date,
    COALESCE(spent.total, 0) as coins_spent,
    COALESCE(earned.total, 0) as coins_earned,
    COALESCE(earned.total, 0) - COALESCE(spent.total, 0) as net_flow
  FROM date_series ds
  LEFT JOIN (
    SELECT 
      created_at::date as date,
      SUM(coin_cost) as total
    FROM videos 
    WHERE created_at::date >= CURRENT_DATE - days_back
    GROUP BY created_at::date
  ) spent ON ds.date = spent.date
  LEFT JOIN (
    SELECT 
      updated_at::date as date,
      SUM(coins_earned_total) as total
    FROM videos 
    WHERE updated_at::date >= CURRENT_DATE - days_back
    GROUP BY updated_at::date
  ) earned ON ds.date = earned.date
  ORDER BY ds.date;
END;
$$;

-- Create helper functions for admin operations
CREATE OR REPLACE FUNCTION get_all_users_with_filters(
  search_term text DEFAULT NULL,
  vip_only boolean DEFAULT FALSE,
  min_coins integer DEFAULT NULL,
  max_coins integer DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  email text,
  username text,
  coins integer,
  is_vip boolean,
  vip_expires_at timestamp with time zone,
  referral_code text,
  referred_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_earned integer,
  total_spent integer,
  videos_posted bigint,
  last_active timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.username,
    p.coins,
    p.is_vip,
    p.vip_expires_at,
    p.referral_code,
    p.referred_by,
    p.created_at,
    p.updated_at,
    COALESCE(earned.total, 0)::integer as total_earned,
    COALESCE(spent.total, 0)::integer as total_spent,
    COALESCE(video_count.count, 0) as videos_posted,
    p.updated_at as last_active
  FROM profiles p
  LEFT JOIN (
    SELECT user_id, SUM(coins_earned_total) as total
    FROM videos
    GROUP BY user_id
  ) earned ON p.id = earned.user_id
  LEFT JOIN (
    SELECT user_id, SUM(coin_cost) as total
    FROM videos
    GROUP BY user_id
  ) spent ON p.id = spent.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM videos
    GROUP BY user_id
  ) video_count ON p.id = video_count.user_id
  WHERE 
    (search_term IS NULL OR 
     p.username ILIKE '%' || search_term || '%' OR 
     p.email ILIKE '%' || search_term || '%')
    AND (NOT vip_only OR p.is_vip = true)
    AND (min_coins IS NULL OR p.coins >= min_coins)
    AND (max_coins IS NULL OR p.coins <= max_coins)
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Create function to get videos with filters
CREATE OR REPLACE FUNCTION get_all_videos_with_filters(
  status_filter text DEFAULT NULL,
  user_search text DEFAULT NULL,
  min_views integer DEFAULT NULL,
  max_views integer DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  youtube_url text,
  title text,
  views_count integer,
  target_views integer,
  duration_seconds integer,
  coin_reward integer,
  coin_cost integer,
  status text,
  hold_until timestamp with time zone,
  repromoted_at timestamp with time zone,
  total_watch_time integer,
  completion_rate numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  completed boolean,
  coins_earned_total integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.user_id,
    p.username,
    v.youtube_url,
    v.title,
    v.views_count,
    v.target_views,
    v.duration_seconds,
    v.coin_reward,
    v.coin_cost,
    v.status,
    v.hold_until,
    v.repromoted_at,
    v.total_watch_time,
    v.completion_rate,
    v.created_at,
    v.updated_at,
    v.completed,
    v.coins_earned_total
  FROM videos v
  LEFT JOIN profiles p ON v.user_id = p.id
  WHERE 
    (status_filter IS NULL OR v.status = status_filter)
    AND (user_search IS NULL OR 
         p.username ILIKE '%' || user_search || '%' OR 
         v.title ILIKE '%' || user_search || '%')
    AND (min_views IS NULL OR v.views_count >= min_views)
    AND (max_views IS NULL OR v.views_count <= max_views)
  ORDER BY v.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;