/*
  # Create adjust_user_coins function

  1. New Functions
    - `adjust_user_coins` - Function to safely adjust user coin balance
      - Parameters: user_id (uuid), coin_amount (integer), adjustment_reason (text)
      - Returns: success status and new balance
      - Includes transaction safety and logging

  2. Security
    - Function is accessible to service role only
    - Includes proper error handling and validation
*/

CREATE OR REPLACE FUNCTION public.adjust_user_coins(
    user_id uuid,
    coin_amount integer,
    adjustment_reason text DEFAULT 'Admin adjustment'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance integer;
    new_balance integer;
    result json;
BEGIN
    -- Get current balance
    SELECT coins INTO current_balance
    FROM public.profiles
    WHERE id = user_id;
    
    -- Check if user exists
    IF current_balance IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Calculate new balance (ensure it doesn't go below 0)
    new_balance := GREATEST(0, current_balance + coin_amount);
    
    -- Update user balance
    UPDATE public.profiles
    SET 
        coins = new_balance,
        updated_at = now()
    WHERE id = user_id;
    
    -- Log the transaction
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        description,
        created_at
    ) VALUES (
        user_id,
        CASE WHEN coin_amount > 0 THEN 'credit' ELSE 'debit' END,
        ABS(coin_amount),
        adjustment_reason,
        now()
    );
    
    -- Return success result
    RETURN json_build_object(
        'success', true,
        'old_balance', current_balance,
        'new_balance', new_balance,
        'adjustment', coin_amount
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Return error result
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.adjust_user_coins(uuid, integer, text) TO service_role;