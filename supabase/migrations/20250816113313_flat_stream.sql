/*
  # Fix backup function permissions

  1. Security Updates
    - Grant execute permissions to service_role for all backup functions
    - Ensure admin panel can execute backup operations

  2. Functions Updated
    - get_table_structure
    - get_table_indexes
    - get_table_triggers
    - get_table_policies
    - get_all_functions
*/

-- Grant execute permissions to service_role for backup functions
GRANT EXECUTE ON FUNCTION get_table_structure(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_table_indexes(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_table_triggers(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_all_functions() TO service_role;

-- Also ensure authenticated users can still access these functions
GRANT EXECUTE ON FUNCTION get_table_structure(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_indexes(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_triggers(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_functions() TO authenticated;

-- Create a function to get table columns for backup service
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(
    column_name text,
    data_type text,
    is_nullable text,
    column_default text,
    character_maximum_length integer
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        c.column_default::text,
        c.character_maximum_length::integer
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.table_name = get_table_columns.table_name
    ORDER BY c.ordinal_position;
END;
$$;

-- Grant permissions for the new function
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO authenticated;

SELECT 'Backup function permissions updated successfully!' as status;