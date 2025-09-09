import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { envManager } from './envManager'

// Supabase clients
let supabase: SupabaseClient | null = null
let supabaseAdmin: SupabaseClient | null = null

// Initialize Supabase with environment variables
export function initializeSupabase(): SupabaseClient | null {
  const supabaseUrl = envManager.getVariable('supabaseUrl')
  const supabaseAnonKey = envManager.getVariable('supabaseAnonKey')

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    // Supabase not configured
    return null
  }

  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    return supabase
  } catch (error) {
    // Failed to initialize Supabase
    return null
  }
}

// Initialize Supabase Admin client with service role key
export function initializeSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = envManager.getVariable('supabaseUrl')
  const supabaseServiceKey = envManager.getVariable('supabaseServiceRoleKey')

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project')) {
    // Supabase Admin not configured
    return null
  }

  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    return supabaseAdmin
  } catch (error) {
    // Failed to initialize Supabase Admin
    return null
  }
}

// Get current Supabase instance (for regular users)
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabase) {
    return initializeSupabase()
  }
  return supabase
}

// Get Supabase Admin instance (bypasses RLS)
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseAdmin) {
    return initializeSupabaseAdmin()
  }
  return supabaseAdmin
}

// Type definitions
export interface Profile {
  id: string
  username: string
  email: string
  coins: number
  is_vip: boolean
  vip_expires_at?: string
  referral_code: string
  referred_by?: string
  total_earned: number
  total_spent: number
  videos_posted: number
  last_active: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  video_id: string
  user_id: string
  username: string
  youtube_url: string
  video_url: string
  title: string
  views_count: number
  target_views: number
  current_views: number
  duration_seconds: number
  coin_reward: number
  coin_cost: number
  spent_coins: number
  status: 'active' | 'completed' | 'on_hold' | 'repromoted' | 'deleted'
  hold_until?: string
  repromoted_at?: string
  total_watch_time: number
  completion_rate: number
  completed: boolean
  coins_earned_total: number
  thumbnail_url: string
  refund_amount?: number
  refund_percent?: number
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface DashboardStats {
  total_users: number
  active_videos: number
  vip_users: number
  monthly_revenue: number
  user_growth_rate: number
  daily_active_users: number
  coin_transactions: number
  total_coins_distributed: number
  video_completion_rate: number
  average_watch_time: number
  total_transactions: number
  pending_videos: number
}

// Empty dashboard stats as fallback when no real data is available
export const emptyDashboardStats: DashboardStats = {
  total_users: 0,
  active_videos: 0,
  vip_users: 0,
  monthly_revenue: 0,
  user_growth_rate: 0,
  daily_active_users: 0,
  coin_transactions: 0,
  total_coins_distributed: 0,
  video_completion_rate: 0,
  average_watch_time: 0,
  total_transactions: 0,
  pending_videos: 0
}

// API Functions using real Supabase data
export async function getDashboardStats(): Promise<DashboardStats> {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase not configured')
  }

  try {
    // Get real stats from your Supabase database
    const { data: stats, error } = await client.rpc('get_dashboard_stats')
    
    if (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`)
    }

    if (!stats || stats.length === 0) {
      throw new Error('No dashboard stats available')
    }

    return stats[0]
  } catch (error) {
    // Error fetching dashboard stats
    throw error
  }
}

export async function getUsers(
  limit = 50,
  offset = 0,
  search?: string,
  isVip?: boolean,
  minCoins?: number
): Promise<Profile[]> {
  const client = getSupabaseClient()
  if (!client) {
    // Cannot fetch users - Supabase not configured
    return []
  }

  try {
    let query = client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (isVip !== undefined) {
      query = query.eq('is_vip', isVip)
    }

    if (minCoins !== undefined) {
      query = query.gte('coins', minCoins)
    }

    const { data, error } = await query

    if (error) {
      // Failed to fetch users
      return []
    }

    return data || []
  } catch (error) {
    // Error fetching users
    return []
  }
}

export async function getVideos(
  limit = 50,
  offset = 0,
  search?: string,
  status?: string,
  dateRange?: [Date | null, Date | null]
): Promise<Video[]> {
  const client = getSupabaseClient()
  if (!client) {
    // Cannot fetch videos - Supabase not configured
    return []
  }

  try {
    let query = client
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`title.ilike.%${search}%,username.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      query = query
        .gte('created_at', dateRange[0].toISOString())
        .lte('created_at', dateRange[1].toISOString())
    }

    const { data, error } = await query

    if (error) {
      // Failed to fetch videos
      return []
    }

    return data || []
  } catch (error) {
    // Error fetching videos
    return []
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const client = getSupabaseClient()
  if (!client) {
    // Cannot fetch user profile - Supabase not configured
    return null
  }

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // Failed to fetch user profile
      return null
    }

    return data
  } catch (error) {
    // Error fetching user profile
    return null
  }
}

export async function adjustUserCoins(
  userId: string,
  amount: number,
  reason: string,
  adminId: string
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  const client = getSupabaseClient()
  if (!client) {
    return { success: false, message: 'Supabase not configured' }
  }

  try {
    const { data, error } = await client.rpc('adjust_user_coins', {
      user_id: userId,
      coin_amount: amount,
      adjustment_reason: reason,
      admin_id: adminId
    })

    if (error) {
      // Failed to adjust user coins
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Coins adjusted successfully', newBalance: data?.new_balance }
  } catch (error) {
    // Error adjusting user coins
    return { success: false, message: 'Failed to adjust coins' }
  }
}

export async function getUserGrowthAnalytics(days: number) {
  const client = getSupabaseClient()
  if (!client) {
    // Cannot fetch analytics - Supabase not configured
    return []
  }

  try {
    const { data, error } = await client.rpc('get_user_growth_analytics', { days_back: days })
    
    if (error) {
      // Failed to fetch user growth analytics
      return []
    }

    return data || []
  } catch (error) {
    // Error fetching user growth analytics
    return []
  }
}