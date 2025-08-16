/*
  # Create transactions table for coin transaction tracking

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `transaction_id` (text, unique identifier)
      - `user_id` (uuid, references profiles)
      - `transaction_type` (text, constrained values)
      - `amount` (integer, can be negative for deductions)
      - `description` (text, optional)
      - `admin_id` (uuid, optional, for admin-initiated transactions)
      - `metadata` (jsonb, for additional transaction data)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for users to read their own transactions
    - Add policy for service role to access all transactions
*/

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id text UNIQUE NOT NULL DEFAULT 'tx_' || extract(epoch from now()) || '_' || substr(gen_random_uuid()::text, 1, 8),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_type text NOT NULL CHECK (transaction_type IN (
        'refund', 
        'coin_purchase', 
        'video_promotion', 
        'bonus', 
        'adjustment', 
        'referral_reward',
        'daily_bonus',
        'vip_purchase',
        'withdrawal'
    )),
    amount integer NOT NULL,
    description text,
    admin_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own transactions
CREATE POLICY "Users can read own transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for service role to access all transactions (for admin panel)
CREATE POLICY "Service role can access all transactions"
    ON public.transactions
    FOR ALL
    TO service_role
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON public.transactions(transaction_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transactions_updated_at();

-- Insert some sample transaction data for testing
INSERT INTO public.transactions (user_id, transaction_type, amount, description) 
SELECT 
    p.id,
    CASE 
        WHEN random() < 0.3 THEN 'coin_purchase'
        WHEN random() < 0.6 THEN 'video_promotion'
        WHEN random() < 0.8 THEN 'bonus'
        ELSE 'adjustment'
    END,
    CASE 
        WHEN random() < 0.7 THEN floor(random() * 1000 + 100)::integer
        ELSE floor(random() * -500 - 50)::integer
    END,
    CASE 
        WHEN random() < 0.3 THEN 'Coin purchase via payment'
        WHEN random() < 0.6 THEN 'Video promotion payment'
        WHEN random() < 0.8 THEN 'Daily login bonus'
        ELSE 'Admin adjustment'
    END
FROM public.profiles p
WHERE random() < 0.8  -- Only create transactions for 80% of users
LIMIT 100;