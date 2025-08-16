/*
  # Create sample data for testing analytics

  1. Sample Data Creation
    - Insert sample users if none exist
    - Insert sample videos if none exist
    - Insert sample transactions if none exist
    - Insert sample bug reports if none exist

  2. Data Integrity
    - Only insert if tables are empty to avoid duplicates
    - Use realistic data patterns
    - Maintain referential integrity
*/

-- Insert sample users if profiles table is empty
DO $$
BEGIN
    IF (SELECT count(*) FROM public.profiles) = 0 THEN
        INSERT INTO public.profiles (id, email, username, coins, is_vip, created_at, updated_at) VALUES
        (gen_random_uuid(), 'user1@example.com', 'user1', 1500, false, now() - interval '30 days', now() - interval '1 day'),
        (gen_random_uuid(), 'user2@example.com', 'user2', 2500, true, now() - interval '25 days', now() - interval '2 days'),
        (gen_random_uuid(), 'user3@example.com', 'user3', 800, false, now() - interval '20 days', now() - interval '3 days'),
        (gen_random_uuid(), 'user4@example.com', 'user4', 3200, true, now() - interval '15 days', now() - interval '1 hour'),
        (gen_random_uuid(), 'user5@example.com', 'user5', 650, false, now() - interval '10 days', now() - interval '5 hours'),
        (gen_random_uuid(), 'user6@example.com', 'user6', 4100, true, now() - interval '8 days', now() - interval '30 minutes'),
        (gen_random_uuid(), 'user7@example.com', 'user7', 920, false, now() - interval '5 days', now() - interval '2 hours'),
        (gen_random_uuid(), 'user8@example.com', 'user8', 1800, false, now() - interval '3 days', now() - interval '6 hours'),
        (gen_random_uuid(), 'user9@example.com', 'user9', 2700, true, now() - interval '2 days', now() - interval '1 hour'),
        (gen_random_uuid(), 'user10@example.com', 'user10', 1200, false, now() - interval '1 day', now() - interval '30 minutes');
        
        RAISE NOTICE 'Inserted 10 sample users';
    ELSE
        RAISE NOTICE 'Users table already has data, skipping sample user creation';
    END IF;
END $$;

-- Insert sample videos if videos table is empty
DO $$
DECLARE
    user_ids uuid[];
    user_id uuid;
    video_statuses text[] := ARRAY['active', 'completed', 'on_hold', 'pending'];
    video_status text;
BEGIN
    IF (SELECT count(*) FROM public.videos) = 0 THEN
        -- Get some user IDs
        SELECT array_agg(id) INTO user_ids FROM public.profiles LIMIT 10;
        
        IF array_length(user_ids, 1) > 0 THEN
            FOR i IN 1..20 LOOP
                user_id := user_ids[1 + (i % array_length(user_ids, 1))];
                video_status := video_statuses[1 + (i % array_length(video_statuses, 1))];
                
                INSERT INTO public.videos (
                    id, user_id, title, youtube_url, views_count, target_views, 
                    coin_cost, status, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(),
                    user_id,
                    'Sample Video ' || i || ' - ' || video_status,
                    'https://youtube.com/watch?v=sample' || i,
                    floor(random() * 5000 + 100)::integer,
                    floor(random() * 10000 + 1000)::integer,
                    floor(random() * 500 + 50)::integer,
                    video_status,
                    now() - (random() * interval '30 days'),
                    now() - (random() * interval '5 days')
                );
            END LOOP;
            
            RAISE NOTICE 'Inserted 20 sample videos';
        ELSE
            RAISE NOTICE 'No users found, cannot create sample videos';
        END IF;
    ELSE
        RAISE NOTICE 'Videos table already has data, skipping sample video creation';
    END IF;
END $$;

-- Insert sample transactions if transactions table is empty
DO $$
DECLARE
    user_ids uuid[];
    user_id uuid;
    transaction_types text[] := ARRAY['coin_purchase', 'video_promotion', 'bonus', 'adjustment', 'refund'];
    transaction_type text;
    amount_val integer;
BEGIN
    IF (SELECT count(*) FROM public.transactions) = 0 THEN
        -- Get some user IDs
        SELECT array_agg(id) INTO user_ids FROM public.profiles LIMIT 10;
        
        IF array_length(user_ids, 1) > 0 THEN
            FOR i IN 1..50 LOOP
                user_id := user_ids[1 + (i % array_length(user_ids, 1))];
                transaction_type := transaction_types[1 + (i % array_length(transaction_types, 1))];
                
                -- Set amount based on transaction type
                amount_val := CASE 
                    WHEN transaction_type = 'coin_purchase' THEN floor(random() * 1000 + 100)::integer
                    WHEN transaction_type = 'video_promotion' THEN -floor(random() * 300 + 50)::integer
                    WHEN transaction_type = 'bonus' THEN floor(random() * 100 + 10)::integer
                    WHEN transaction_type = 'adjustment' THEN floor(random() * 200 - 100)::integer
                    WHEN transaction_type = 'refund' THEN floor(random() * 500 + 50)::integer
                    ELSE floor(random() * 100)::integer
                END;
                
                INSERT INTO public.transactions (
                    user_id, transaction_type, amount, description, created_at, updated_at
                ) VALUES (
                    user_id,
                    transaction_type,
                    amount_val,
                    'Sample ' || transaction_type || ' transaction #' || i,
                    now() - (random() * interval '30 days'),
                    now() - (random() * interval '5 days')
                );
            END LOOP;
            
            RAISE NOTICE 'Inserted 50 sample transactions';
        ELSE
            RAISE NOTICE 'No users found, cannot create sample transactions';
        END IF;
    ELSE
        RAISE NOTICE 'Transactions table already has data, skipping sample transaction creation';
    END IF;
END $$;

-- Insert sample bug reports if bug_reports table is empty
DO $$
DECLARE
    bug_statuses text[] := ARRAY['new', 'in_progress', 'fixed'];
    bug_priorities text[] := ARRAY['low', 'medium', 'high', 'critical'];
    bug_sources text[] := ARRAY['mobile_app', 'admin_panel'];
    bug_status text;
    bug_priority text;
    bug_source text;
BEGIN
    IF (SELECT count(*) FROM public.bug_reports) = 0 THEN
        FOR i IN 1..15 LOOP
            bug_status := bug_statuses[1 + (i % array_length(bug_statuses, 1))];
            bug_priority := bug_priorities[1 + (i % array_length(bug_priorities, 1))];
            bug_source := bug_sources[1 + (i % array_length(bug_sources, 1))];
            
            INSERT INTO public.bug_reports (
                bug_id, title, description, status, priority, category, 
                reported_by, source, issue_type, created_at, updated_at
            ) VALUES (
                'BUG-' || lpad(i::text, 3, '0'),
                'Sample Bug Report #' || i || ' - ' || bug_priority || ' priority',
                'This is a sample bug report describing issue #' || i || '. The issue affects ' || bug_source || ' functionality and has ' || bug_priority || ' priority.',
                bug_status,
                bug_priority,
                CASE WHEN bug_source = 'mobile_app' THEN 'Mobile App Technical' ELSE 'System' END,
                'user' || (i % 5 + 1) || '@example.com',
                bug_source,
                CASE WHEN bug_source = 'mobile_app' THEN 'technical' ELSE 'system' END,
                now() - (random() * interval '30 days'),
                now() - (random() * interval '5 days')
            );
        END LOOP;
        
        RAISE NOTICE 'Inserted 15 sample bug reports';
    ELSE
        RAISE NOTICE 'Bug reports table already has data, skipping sample bug report creation';
    END IF;
END $$;

-- Insert sample admin logs if admin_logs table is empty
DO $$
BEGIN
    IF (SELECT count(*) FROM public.admin_logs) = 0 THEN
        INSERT INTO public.admin_logs (
            admin_id, action, target_type, target_id, details, created_at
        ) VALUES
        ('admin-1', 'user_coin_adjustment', 'user', gen_random_uuid()::text, '{"description": "Coin adjustment", "value": "+500"}', now() - interval '1 hour'),
        ('admin-1', 'video_deletion', 'video', gen_random_uuid()::text, '{"description": "Video deleted for policy violation", "value": "Policy Violation"}', now() - interval '2 hours'),
        ('admin-1', 'user_vip_toggle', 'user', gen_random_uuid()::text, '{"description": "VIP status granted", "value": "VIP Granted"}', now() - interval '3 hours'),
        ('admin-1', 'system_config_update', 'config', 'FEATURE_ADS_ENABLED', '{"description": "Feature flag updated", "value": "true"}', now() - interval '4 hours'),
        ('admin-1', 'bulk_notification', 'notification', 'bulk-001', '{"description": "Bulk notification sent", "value": "150 users"}', now() - interval '5 hours');
        
        RAISE NOTICE 'Inserted 5 sample admin logs';
    ELSE
        RAISE NOTICE 'Admin logs table already has data, skipping sample admin log creation';
    END IF;
END $$;

SELECT 'Sample data creation completed!' as status;