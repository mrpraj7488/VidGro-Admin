/*
  # Create analytics and reporting functions

  1. New Functions
    - `get_dashboard_stats()` - Get comprehensive dashboard statistics
    - `get_user_growth_analytics(days_back integer)` - Get user growth data
    - `get_video_analytics(days_back integer)` - Get video promotion analytics
    - `get_coin_transaction_analytics(days_back integer)` - Get coin transaction analytics
    - `adjust_user_coins(user_id uuid, coin_amount integer, adjustment_reason text, admin_id text)` - Adjust user coins

  2. Security
    - Grant execute permissions to service_role and authenticated users
    - Ensure proper data access for analytics
*/

-- Function to get comprehensive dashboard statistics
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
DECLARE
    current_month_start date := date_trunc('month', current_date);
    last_month_start date := date_trunc('month', current_date - interval '1 month');
    seven_days_ago date := current_date - interval '7 days';
BEGIN
    RETURN QUERY
    SELECT 
        -- Total users
        (SELECT count(*) FROM public.profiles)::bigint as total_users,
        
        -- Active videos
        (SELECT count(*) FROM public.videos WHERE status = 'active')::bigint as active_videos,
        
        -- VIP users
        (SELECT count(*) FROM public.profiles WHERE is_vip = true)::bigint as vip_users,
        
        -- Monthly revenue (assuming 1 cent per coin)
        (SELECT COALESCE(sum(amount * 0.01), 0) 
         FROM public.transactions 
         WHERE transaction_type = 'coin_purchase' 
         AND created_at >= current_month_start)::numeric as monthly_revenue,
        
        -- User growth rate (percentage change from last month)
        (SELECT 
            CASE 
                WHEN last_month_count = 0 THEN 0
                ELSE ((current_month_count - last_month_count)::numeric / last_month_count * 100)
            END
         FROM (
            SELECT 
                (SELECT count(*) FROM public.profiles WHERE created_at >= current_month_start) as current_month_count,
                (SELECT count(*) FROM public.profiles WHERE created_at >= last_month_start AND created_at < current_month_start) as last_month_count
         ) growth_calc)::numeric as user_growth_rate,
        
        -- Daily active users (users active in last 7 days)
        (SELECT count(*) FROM public.profiles WHERE updated_at >= seven_days_ago)::bigint as daily_active_users,
        
        -- Coin transactions
        (SELECT count(*) FROM public.transactions WHERE created_at >= current_month_start)::bigint as coin_transactions,
        
        -- Total coins distributed
        (SELECT COALESCE(sum(coins), 0) FROM public.profiles)::bigint as total_coins_distributed,
        
        -- Video completion rate
        (SELECT 
            CASE 
                WHEN total_videos = 0 THEN 0
                ELSE (completed_videos::numeric / total_videos * 100)
            END
         FROM (
            SELECT 
                count(*) as total_videos,
                count(*) FILTER (WHERE status = 'completed') as completed_videos
            FROM public.videos
         ) completion_calc)::numeric as video_completion_rate,
        
        -- Average watch time (mock calculation)
        45.5::numeric as average_watch_time,
        
        -- Total transactions
        (SELECT count(*) FROM public.transactions)::bigint as total_transactions,
        
        -- Pending videos
        (SELECT count(*) FROM public.videos WHERE status = 'pending')::bigint as pending_videos;
END;
$$;

-- Function to get user growth analytics
CREATE OR REPLACE FUNCTION get_user_growth_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(
    date_label text,
    new_users bigint,
    active_users bigint,
    total_users bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    start_date date := current_date - (days_back || ' days')::interval;
    current_day date;
BEGIN
    FOR i IN 0..days_back-1 LOOP
        current_day := start_date + (i || ' days')::interval;
        
        RETURN QUERY
        SELECT 
            to_char(current_day, 'Mon DD') as date_label,
            (SELECT count(*) FROM public.profiles 
             WHERE date(created_at) = current_day)::bigint as new_users,
            (SELECT count(*) FROM public.profiles 
             WHERE date(updated_at) = current_day)::bigint as active_users,
            (SELECT count(*) FROM public.profiles 
             WHERE created_at <= current_day + interval '1 day')::bigint as total_users;
    END LOOP;
END;
$$;

-- Function to get video analytics
CREATE OR REPLACE FUNCTION get_video_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(
    date_label text,
    videos_created bigint,
    videos_completed bigint,
    total_views bigint,
    coins_spent bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    start_date date := current_date - (days_back || ' days')::interval;
    current_day date;
BEGIN
    FOR i IN 0..days_back-1 LOOP
        current_day := start_date + (i || ' days')::interval;
        
        RETURN QUERY
        SELECT 
            to_char(current_day, 'Mon DD') as date_label,
            (SELECT count(*) FROM public.videos 
             WHERE date(created_at) = current_day)::bigint as videos_created,
            (SELECT count(*) FROM public.videos 
             WHERE date(updated_at) = current_day AND status = 'completed')::bigint as videos_completed,
            (SELECT COALESCE(sum(views_count), 0) FROM public.videos 
             WHERE date(created_at) = current_day)::bigint as total_views,
            (SELECT COALESCE(sum(coin_cost), 0) FROM public.videos 
             WHERE date(created_at) = current_day)::bigint as coins_spent;
    END LOOP;
END;
$$;

-- Function to get coin transaction analytics
CREATE OR REPLACE FUNCTION get_coin_transaction_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(
    date_label text,
    transaction_count bigint,
    total_volume bigint,
    purchases bigint,
    promotions bigint,
    refunds bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    start_date date := current_date - (days_back || ' days')::interval;
    current_day date;
BEGIN
    FOR i IN 0..days_back-1 LOOP
        current_day := start_date + (i || ' days')::interval;
        
        RETURN QUERY
        SELECT 
            to_char(current_day, 'Mon DD') as date_label,
            (SELECT count(*) FROM public.transactions 
             WHERE date(created_at) = current_day)::bigint as transaction_count,
            (SELECT COALESCE(sum(abs(amount)), 0) FROM public.transactions 
             WHERE date(created_at) = current_day)::bigint as total_volume,
            (SELECT count(*) FROM public.transactions 
             WHERE date(created_at) = current_day AND transaction_type = 'coin_purchase')::bigint as purchases,
            (SELECT count(*) FROM public.transactions 
             WHERE date(created_at) = current_day AND transaction_type = 'video_promotion')::bigint as promotions,
            (SELECT count(*) FROM public.transactions 
             WHERE date(created_at) = current_day AND transaction_type = 'refund')::bigint as refunds;
    END LOOP;
END;
$$;

-- Function to adjust user coins with transaction logging
CREATE OR REPLACE FUNCTION adjust_user_coins(
    user_id uuid,
    coin_amount integer,
    adjustment_reason text,
    admin_id text
)
RETURNS TABLE(
    success boolean,
    new_balance integer,
    transaction_id text
)
LANGUAGE plpgsql
AS $$
DECLARE
    current_balance integer;
    new_balance_calc integer;
    tx_id text;
BEGIN
    -- Get current balance
    SELECT coins INTO current_balance FROM public.profiles WHERE id = user_id;
    
    IF current_balance IS NULL THEN
        RETURN QUERY SELECT false, 0, ''::text;
        RETURN;
    END IF;
    
    -- Calculate new balance
    new_balance_calc := current_balance + coin_amount;
    
    -- Ensure balance doesn't go negative
    IF new_balance_calc < 0 THEN
        new_balance_calc := 0;
    END IF;
    
    -- Update user balance
    UPDATE public.profiles 
    SET coins = new_balance_calc, updated_at = now()
    WHERE id = user_id;
    
    -- Create transaction record
    INSERT INTO public.transactions (
        user_id, 
        transaction_type, 
        amount, 
        description, 
        admin_id
    ) VALUES (
        user_id,
        CASE WHEN coin_amount > 0 THEN 'adjustment' ELSE 'adjustment' END,
        coin_amount,
        adjustment_reason,
        admin_id::uuid
    ) RETURNING transaction_id INTO tx_id;
    
    RETURN QUERY SELECT true, new_balance_calc, tx_id;
END;
$$;

-- Grant execute permissions to service_role and authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO service_role;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_growth_analytics(integer) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_growth_analytics(integer) TO authenticated;

GRANT EXECUTE ON FUNCTION get_video_analytics(integer) TO service_role;
GRANT EXECUTE ON FUNCTION get_video_analytics(integer) TO authenticated;

GRANT EXECUTE ON FUNCTION get_coin_transaction_analytics(integer) TO service_role;
GRANT EXECUTE ON FUNCTION get_coin_transaction_analytics(integer) TO authenticated;

GRANT EXECUTE ON FUNCTION adjust_user_coins(uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION adjust_user_coins(uuid, integer, text, text) TO authenticated;

-- Test the functions
SELECT 'Analytics functions created successfully!' as status;