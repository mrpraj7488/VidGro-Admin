/*
  # Create video deletions tracking table

  1. New Tables
    - `video_deletions`
      - `id` (uuid, primary key)
      - `video_id` (uuid, references videos table)
      - `user_id` (uuid, references profiles table)
      - `video_title` (text, for record keeping)
      - `coin_cost` (integer, original cost)
      - `deletion_reason` (text, admin reason)
      - `deleted_by` (text, admin identifier)
      - `refund_amount` (integer, coins refunded)
      - `refund_percentage` (integer, percentage refunded)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `video_deletions` table
    - Add policy for service role to access all records
*/

CREATE TABLE IF NOT EXISTS public.video_deletions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id uuid NOT NULL,
    user_id uuid REFERENCES public.profiles(id),
    video_title text NOT NULL,
    coin_cost integer DEFAULT 0,
    deletion_reason text NOT NULL,
    deleted_by text NOT NULL,
    refund_amount integer DEFAULT 0,
    refund_percentage integer DEFAULT 100,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_deletions ENABLE ROW LEVEL SECURITY;

-- Policy for service role to access all records (for admin operations)
CREATE POLICY "Service role can access all video deletions"
    ON public.video_deletions
    FOR ALL
    TO service_role
    USING (true);

-- Policy for authenticated users to read their own deletion records
CREATE POLICY "Users can read own video deletions"
    ON public.video_deletions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_video_deletions_user_id ON public.video_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_deletions_video_id ON public.video_deletions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_deletions_created_at ON public.video_deletions(created_at);