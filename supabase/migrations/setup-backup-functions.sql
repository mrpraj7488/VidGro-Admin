-- Setup Backup Functions for Complete Database Backup
-- Run this script in your Supabase SQL Editor to enable complete database backups

-- Function to get table structure
CREATE OR REPLACE FUNCTION get_table_structure(table_name text)
RETURNS TABLE(create_statement text)
LANGUAGE plpgsql
AS $$
DECLARE
    table_def text;
    constraint_def text;
    final_def text;
BEGIN
    -- Get table definition
    SELECT 
        'CREATE TABLE IF NOT EXISTS "' || table_name || '" (' ||
        string_agg(
            '"' || column_name || '" ' || 
            data_type ||
            CASE 
                WHEN character_maximum_length IS NOT NULL 
                THEN '(' || character_maximum_length || ')'
                ELSE ''
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
            ', '
            ORDER BY ordinal_position
        ) || ');'
    INTO table_def
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = get_table_structure.table_name;
    
    -- Get constraints
    SELECT 
        string_agg(
            'ALTER TABLE "' || table_name || '" ADD CONSTRAINT "' || constraint_name || '" ' ||
            constraint_type || ' (' || string_agg('"' || column_name || '"', ', ') || ');',
            E'\n'
        )
    INTO constraint_def
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public' 
    AND tc.table_name = get_table_structure.table_name
    AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
    GROUP BY tc.constraint_name, tc.constraint_type;
    
    -- Combine table definition and constraints
    final_def := table_def;
    IF constraint_def IS NOT NULL THEN
        final_def := final_def || E'\n' || constraint_def;
    END IF;
    
    RETURN QUERY SELECT final_def;
END;
$$;

-- Function to get table indexes
CREATE OR REPLACE FUNCTION get_table_indexes(table_name text)
RETURNS TABLE(create_statement text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'CREATE INDEX IF NOT EXISTS "' || indexname || '" ON "' || tablename || '" (' || 
        string_agg('"' || attname || '"', ', ' ORDER BY attnum) || ');'
    FROM pg_indexes 
    JOIN pg_class c ON c.relname = indexname
    JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE tablename = get_table_indexes.table_name
    AND indexname NOT LIKE '%_pkey'  -- Skip primary key indexes
    AND indexname NOT LIKE '%_unique'  -- Skip unique constraint indexes
    GROUP BY indexname, tablename;
END;
$$;

-- Function to get table triggers
CREATE OR REPLACE FUNCTION get_table_triggers(table_name text)
RETURNS TABLE(create_statement text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'CREATE TRIGGER "' || trigger_name || '" ' ||
        trigger_timing || ' ' || event_manipulation || ' ON "' || event_object_table || '" ' ||
        'FOR EACH ' || action_timing || ' ' ||
        action_statement || ';'
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    AND event_object_table = get_table_triggers.table_name;
END;
$$;

-- Function to get RLS policies
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS TABLE(create_statement text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'CREATE POLICY "' || policyname || '" ON "' || tablename || '" ' ||
        'FOR ' || cmd || ' ' ||
        'USING (' || qual || ');'
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = get_table_policies.table_name;
END;
$$;

-- Function to get all functions
CREATE OR REPLACE FUNCTION get_all_functions()
RETURNS TABLE(create_statement text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'CREATE OR REPLACE FUNCTION ' || p.proname || '(' ||
        pg_get_function_identity_arguments(p.oid) || ') ' ||
        'RETURNS ' || pg_get_function_result(p.oid) || ' ' ||
        'LANGUAGE ' || l.lanname || ' ' ||
        'AS ' || quote_literal(p.prosrc) || ';'
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_language l ON p.prolang = l.oid
    WHERE n.nspname = 'public'
    AND p.proname NOT LIKE 'get_%'  -- Skip our backup functions
    AND p.proname NOT IN ('get_table_structure', 'get_table_indexes', 'get_table_triggers', 'get_table_policies', 'get_all_functions');
END;
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_structure(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_indexes(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_triggers(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_functions() TO authenticated;

-- Test the functions
SELECT 'Backup functions created successfully!' as status;
