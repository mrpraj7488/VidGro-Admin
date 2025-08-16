/*
  # Create support tickets table

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `status` (text, default 'new', constrained values)
      - `priority` (text, default 'medium', constrained values)
      - `category` (text, default 'general')
      - `reported_by` (text, required)
      - `assigned_to` (text, optional)
      - `admin_replies` (jsonb, default empty array)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `support_tickets` table
    - Add policy for authenticated users to read and write their own tickets
    - Add policy for service role to access all tickets
*/

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category text NOT NULL DEFAULT 'general',
    reported_by text NOT NULL,
    assigned_to text,
    admin_replies jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read and write their own tickets
CREATE POLICY "Users can manage own tickets"
    ON public.support_tickets
    FOR ALL
    TO authenticated
    USING (auth.uid()::text = reported_by);

-- Policy for service role to access all tickets (for admin panel)
CREATE POLICY "Service role can access all tickets"
    ON public.support_tickets
    FOR ALL
    TO service_role
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
