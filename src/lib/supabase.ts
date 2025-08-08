import { createClient } from '@supabase/supabase-js'
import { envManager } from './envManager'
import { logger } from './logger'
import { RuntimeConfig, ConfigAuditLog, ClientRuntimeConfig } from '../types/admin'

// Get environment variables from the environment manager
const getSupabaseConfig = () => {
  const envVars = envManager.getEnvironmentVariables()
  return {
    url: envVars.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: envVars.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key',
    serviceRoleKey: envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key'
  }
}

const supabaseConfig = getSupabaseConfig()

// Regular client for auth and basic operations
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000)
  }
})

// Admin client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types matching the VidGro schema
export interface Profile {
  id: string
  email: string
  username: string
  coins: number
  is_vip: boolean
  vip_expires_at?: string
  referral_code?: string
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
  user_id: string
  username?: string
  youtube_url: string
  title: string
  views_count: number
  target_views: number
  duration_seconds: number
  coin_reward: number
  coin_cost: number
  status: 'active' | 'paused' | 'completed' | 'on_hold' | 'repromoted' | 'deleted'
  hold_until?: string
  repromoted_at?: string
  total_watch_time: number
  completion_rate: number
  created_at: string
  updated_at: string
  completed: boolean
  coins_earned_total: number
  completed_at?: string
  // Additional fields for admin panel compatibility
  video_id: string
  video_url: string
  spent_coins: number
  thumbnail_url: string
  current_views: number
  refund_amount?: number
  refund_percent?: number
}

export interface AdminProfile {
  id: string
  user_id?: string
  email: string
  role: 'super_admin' | 'content_moderator' | 'analytics_viewer' | 'user_support'
  permissions: Record<string, boolean>
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_type?: string
  target_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  details?: Record<string, any>
  created_at: string
}

export interface VideoDeletion {
  id: string
  video_id: string
  user_id: string
  video_title: string
  coin_cost: number
  refund_amount: number
  refund_percentage: number
  deleted_at: string
  created_at: string
}

// Dashboard stats interface
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

// Mock data for demo purposes (when Supabase is not configured)
export const mockDashboardStats: DashboardStats = {
  total_users: 45732,
  active_videos: 8924,
  vip_users: 3247,
  monthly_revenue: 89500,
  user_growth_rate: 12.5,
  daily_active_users: 12453,
  coin_transactions: 8924,
  total_coins_distributed: 2500000,
  video_completion_rate: 78.5,
  average_watch_time: 145,
  total_transactions: 156789,
  pending_videos: 234
}

export const mockUsers: Profile[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i + 1}`,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  coins: Math.floor(Math.random() * 10000),
  is_vip: Math.random() > 0.7,
  vip_expires_at: Math.random() > 0.5 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  referral_code: `REF${String(i + 1).padStart(4, '0')}`,
  referred_by: Math.random() > 0.7 ? `user-${Math.floor(Math.random() * i) + 1}` : undefined,
  total_earned: Math.floor(Math.random() * 50000),
  total_spent: Math.floor(Math.random() * 30000),
  videos_posted: Math.floor(Math.random() * 50),
  last_active: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
}))

export const mockVideos: Video[] = Array.from({ length: 15 }, (_, i) => ({
  id: `video-${i + 1}`,
  video_id: `VID${String(i + 1).padStart(6, '0')}`,
  user_id: `user-${Math.floor(Math.random() * 20) + 1}`,
  username: `user${Math.floor(Math.random() * 20) + 1}`,
  youtube_url: `https://youtube.com/watch?v=example${i + 1}`,
  video_url: `https://youtube.com/watch?v=example${i + 1}`,
  title: `Amazing Video Content ${i + 1}`,
  views_count: Math.floor(Math.random() * 100000),
  target_views: Math.floor(Math.random() * 10000) + 1000,
  current_views: Math.floor(Math.random() * 5000),
  duration_seconds: Math.floor(Math.random() * 600) + 60,
  coin_reward: Math.floor(Math.random() * 100) + 10,
  coin_cost: Math.floor(Math.random() * 5000) + 100,
  spent_coins: Math.floor(Math.random() * 5000) + 100,
  status: ['active', 'completed', 'on_hold', 'repromoted', 'deleted'][Math.floor(Math.random() * 5)] as any,
  hold_until: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
  repromoted_at: Math.random() > 0.8 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  total_watch_time: Math.floor(Math.random() * 10000),
  completion_rate: Math.floor(Math.random() * 100),
  completed: Math.random() > 0.5,
  coins_earned_total: Math.floor(Math.random() * 10000),
  thumbnail_url: `https://images.pexels.com/photos/${2000 + i}/pexels-photo-${2000 + i}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`,
  refund_amount: Math.random() > 0.8 ? Math.floor(Math.random() * 1000) : undefined,
  refund_percent: Math.random() > 0.8 ? Math.floor(Math.random() * 100) : undefined,
  created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  completed_at: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
}))

export const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  users: Math.floor(Math.random() * 1000) + 500,
  videos: Math.floor(Math.random() * 200) + 100,
  coins: Math.floor(Math.random() * 50000) + 10000
}))

export const mockAnalyticsData = {
  dailyActiveUsers: 12453,
  coinTransactions: 8924,
  totalPromoted: 2847,
  videosDeleted: 156,
  userGrowthData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activeUsers: Math.floor(Math.random() * 800) + 400
  })),
  coinTransactionData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transactions: Math.floor(Math.random() * 500) + 200,
    volume: Math.floor(Math.random() * 50000) + 10000
  })),
  topVideos: Array.from({ length: 5 }, (_, i) => ({
    id: `top-video-${i + 1}`,
    title: `Top Performing Video ${i + 1}`,
    thumbnail: `https://images.pexels.com/photos/${3000 + i}/pexels-photo-${3000 + i}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`,
    views: Math.floor(Math.random() * 100000) + 50000,
    completionRate: Math.floor(Math.random() * 30) + 70,
    coinsEarned: Math.floor(Math.random() * 5000) + 2000
  })),
  recentActivity: Array.from({ length: 10 }, (_, i) => ({
    type: ['user', 'video', 'coin', 'promotion'][Math.floor(Math.random() * 4)],
    description: `Activity ${i + 1} description`,
    timestamp: `${Math.floor(Math.random() * 60)} minutes ago`,
    value: `${Math.floor(Math.random() * 1000)}`
  }))
}

// Mock bug report data
export const mockBugReportData = {
  newBugs: 15,
  bugsFixedToday: 8,
  totalBugs: 127,
  bugReports: Array.from({ length: 12 }, (_, i) => ({
    bug_id: `bug-${i + 1}`,
    title: [
      'Video upload fails on mobile',
      'Coin balance not updating',
      'Push notifications not working',
      'App crashes on video play',
      'VIP features not accessible',
      'Payment processing error',
      'Profile picture upload issue',
      'Video thumbnail missing',
      'Referral system bug',
      'Dark mode toggle broken',
      'Search functionality slow',
      'Analytics data incorrect'
    ][i],
    description: `Detailed description of bug ${i + 1}. This includes steps to reproduce, expected behavior, and actual behavior observed by users.`,
    status: ['new', 'in_progress', 'fixed', 'wont_fix'][Math.floor(Math.random() * 4)] as 'new' | 'in_progress' | 'fixed' | 'wont_fix',
    priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'critical',
    reported_by: `user${Math.floor(Math.random() * 100) + 1}`,
    assigned_to: Math.random() > 0.5 ? `admin${Math.floor(Math.random() * 5) + 1}` : undefined,
    category: ['UI/UX', 'Backend', 'Mobile App', 'Payment', 'Video Processing', 'General'][Math.floor(Math.random() * 6)],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

export const mockSystemSettings = {
  general: {
    platformName: 'VidGro',
    supportEmail: 'support@vidgro.com',
    maxVideoSize: 100,
    allowedVideoFormats: ['mp4', 'mov', 'avi'],
    maintenanceMode: false
  },
  users: {
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxCoinsPerUser: 100000,
    vipUpgradePrice: 9.99,
    referralReward: 50
  },
  videos: {
    maxVideosPerUser: 10,
    autoModerationEnabled: true,
    minVideoLength: 10,
    maxVideoLength: 300,
    thumbnailRequired: true
  },
  economy: {
    coinPrice: 0.01,
    videoReward: 10,
    dailyBonusCoins: 5,
    vipMultiplier: 2.0,
    withdrawalMinimum: 1000
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    moderationAlerts: true,
    systemAlerts: true,
    weeklyReports: true
  },
  security: {
    twoFactorRequired: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    ipWhitelist: []
  }
}

// API functions using the new database schema
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const config = getSupabaseConfig()
    // Check if we're using placeholder URLs
    if (config.url.includes('your-project')) {
      logger.warn('Using mock data - Supabase not configured', null, 'supabase')
      return mockDashboardStats
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_admin_dashboard_stats')
    if (error) throw error
    
    // Transform the data to match our interface
    const stats = data[0] || mockDashboardStats
    return {
      total_users: Number(stats.total_users),
      active_videos: Number(stats.active_videos),
      vip_users: Number(stats.vip_users),
      monthly_revenue: Number(stats.monthly_revenue),
      user_growth_rate: Number(stats.user_growth_rate),
      daily_active_users: Number(stats.daily_active_users),
      coin_transactions: Number(stats.coin_transactions),
      total_coins_distributed: Number(stats.total_coins_distributed),
      video_completion_rate: Number(stats.video_completion_rate),
      average_watch_time: Number(stats.average_watch_time),
      total_transactions: Number(stats.total_transactions),
      pending_videos: Number(stats.pending_videos)
    }
  } catch (error) {
    logger.warn('Using mock data for dashboard stats', error, 'supabase')
    return mockDashboardStats
  }
}

export const getUsers = async (
  limit = 50, 
  offset = 0, 
  searchTerm?: string, 
  vipOnly = false, 
  minCoins?: number, 
  maxCoins?: number
): Promise<Profile[]> => {
  try {
    const config = getSupabaseConfig()
    // Check if we're using placeholder URLs
    if (config.url.includes('your-project')) {
      logger.warn('Using mock data - Supabase not configured', null, 'supabase')
      return mockUsers
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_all_users_with_filters', {
      search_term: searchTerm || null,
      vip_only: vipOnly,
      min_coins: minCoins || null,
      max_coins: maxCoins || null,
      limit_count: limit,
      offset_count: offset
    })
    
    if (error) throw error
    return data || mockUsers
  } catch (error) {
    logger.warn('Using mock data for users', error, 'supabase')
    return mockUsers
  }
}

export const getVideos = async (
  limit = 50, 
  offset = 0, 
  statusFilter?: string, 
  userSearch?: string, 
  minViews?: number, 
  maxViews?: number
): Promise<Video[]> => {
  try {
    const config = getSupabaseConfig()
    // Check if we're using placeholder URLs
    if (config.url.includes('your-project')) {
      logger.warn('Using mock data - Supabase not configured', null, 'supabase')
      return mockVideos
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_all_videos_with_filters', {
      status_filter: statusFilter || null,
      user_search: userSearch || null,
      min_views: minViews || null,
      max_views: maxViews || null,
      limit_count: limit,
      offset_count: offset
    })
    
    if (error) throw error
    
    // Transform data to match expected format
    const transformedData = data?.map(video => ({
      ...video,
      video_id: video.id,
      video_url: video.youtube_url,
      spent_coins: video.coin_cost,
      current_views: video.views_count,
      thumbnail_url: `https://images.pexels.com/photos/2000/pexels-photo-2000.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`
    })) || mockVideos
    
    return transformedData
  } catch (error) {
    logger.warn('Using mock data for videos', error, 'supabase')
    return mockVideos
  }
}

export const adjustUserCoins = async (
  userId: string, 
  amount: number, 
  reason: string, 
  adminId: string
): Promise<{ success: boolean; message: string; newBalance?: number }> => {
  try {
    const config = getSupabaseConfig()
    // Check if we're using placeholder URLs
    if (config.url.includes('your-project')) {
      logger.info('Mock mode - coin adjustment simulated', { userId, amount, reason }, 'supabase')
      return { success: true, message: 'Coin adjustment simulated in demo mode', newBalance: 1000 + amount }
    }
    
    const { data, error } = await supabaseAdmin.rpc('admin_adjust_user_coins', {
      user_uuid: userId,
      coin_adjustment: amount,
      reason,
      admin_id: adminId
    })
    
    if (error) throw error
    return data
  } catch (error) {
    logger.error('Failed to adjust user coins', error, 'supabase')
    throw error
  }
}

export const updateVideoStatus = async (
  videoId: string, 
  status: string, 
  adminId: string, 
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const config = getSupabaseConfig()
    // Check if we're using placeholder URLs
    if (config.url.includes('your-project')) {
      logger.info('Mock mode - video status update simulated', { videoId, status, reason }, 'supabase')
      return { success: true, message: 'Video status update simulated in demo mode' }
    }
    
    const { data, error } = await supabaseAdmin.rpc('admin_update_video_status', {
      video_uuid: videoId,
      new_status: status,
      admin_id: adminId,
      reason: reason || null
    })
    
    if (error) throw error
    return data
  } catch (error) {
    logger.error('Failed to update video status', error, 'supabase')
    throw error
  }
}

// Add VIP toggle function
export const toggleUserVip = async (userId: string, adminId: string = 'admin-1') => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      logger.info('Mock mode - VIP toggle simulated', { userId }, 'supabase')
      return { success: true, message: 'VIP status toggled in demo mode' }
    }
    
    // Get current VIP status
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('is_vip')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    
    const newVipStatus = !userData.is_vip
    
    // Update VIP status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_vip: newVipStatus,
        vip_expires_at: newVipStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (updateError) throw updateError
    
    // Log the action
    await supabaseAdmin.rpc('log_admin_action', {
      admin_id_param: adminId,
      action_param: 'toggle_vip_status',
      target_type_param: 'profile',
      target_id_param: userId,
      old_values_param: { is_vip: userData.is_vip },
      new_values_param: { is_vip: newVipStatus },
      ip_address_param: 'admin_panel',
      user_agent_param: 'admin_panel',
      details_param: { reason: 'VIP status toggled by admin' }
    })
    
    return { success: true, message: 'VIP status updated successfully', newStatus: newVipStatus }
  } catch (error) {
    logger.error('Failed to toggle VIP status', error, 'supabase')
    throw error
  }
}

export const getUserGrowthAnalytics = async (daysBack = 30) => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      return mockAnalyticsData.userGrowthData
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_user_growth_analytics', {
      days_back: daysBack
    })
    
    if (error) throw error
    return data || mockAnalyticsData.userGrowthData
  } catch (error) {
    logger.warn('Using mock data for user growth analytics', error, 'supabase')
    return mockAnalyticsData.userGrowthData
  }
}

export const getVideoPerformanceAnalytics = async (daysBack = 30) => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      return mockAnalyticsData.coinTransactionData
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_video_performance_analytics', {
      days_back: daysBack
    })
    
    if (error) throw error
    return data || mockAnalyticsData.coinTransactionData
  } catch (error) {
    logger.warn('Using mock data for video performance analytics', error, 'supabase')
    return mockAnalyticsData.coinTransactionData
  }
}

export const getCoinEconomyAnalytics = async (daysBack = 30) => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      return mockAnalyticsData.coinTransactionData
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_coin_economy_analytics', {
      days_back: daysBack
    })
    
    if (error) throw error
    return data || mockAnalyticsData.coinTransactionData
  } catch (error) {
    logger.warn('Using mock data for coin economy analytics', error, 'supabase')
    return mockAnalyticsData.coinTransactionData
  }
}

export const getSystemConfig = async () => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      return mockSystemSettings
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_system_config')
    
    if (error) throw error
    return data || mockSystemSettings
  } catch (error) {
    logger.warn('Using mock data for system config', error, 'supabase')
    return mockSystemSettings
  }
}

export const getAdminLogs = async (
  adminId?: string, 
  action?: string, 
  daysBack = 30, 
  limit = 100
): Promise<AdminLog[]> => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      return []
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_admin_logs', {
      admin_id_filter: adminId || null,
      action_filter: action || null,
      days_back: daysBack,
      limit_count: limit
    })
    
    if (error) throw error
    return data || []
  } catch (error) {
    logger.warn('Failed to fetch admin logs', error, 'supabase')
    return []
  }
}

export const checkAdminPermission = async (adminEmail: string, permission: string): Promise<boolean> => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      return true // Allow all permissions in demo mode
    }
    
    const { data, error } = await supabaseAdmin.rpc('check_admin_permission', {
      admin_email: adminEmail,
      required_permission: permission
    })
    
    if (error) throw error
    return data || false
  } catch (error) {
    logger.warn('Failed to check admin permission', error, 'supabase')
    return false
  }
}

// Runtime Configuration API functions
export const getRuntimeConfig = async (environment = 'production'): Promise<RuntimeConfig[]> => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      logger.warn('Using mock data - Supabase not configured', null, 'supabase')
      return []
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_all_runtime_config', {
      env_name: environment
    })
    
    if (error) throw error
    
    return data?.map(item => ({
      id: item.id,
      key: item.key,
      value: item.value,
      isPublic: item.is_public,
      environment: item.environment,
      description: item.description,
      category: item.category,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || []
  } catch (error) {
    logger.error('Failed to fetch runtime config', error, 'supabase')
    return []
  }
}

export const upsertRuntimeConfig = async (
  key: string,
  value: string,
  isPublic: boolean,
  environment = 'production',
  description?: string,
  category = 'general',
  reason?: string
): Promise<{ success: boolean; message: string; configId?: string }> => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      logger.info('Mock mode - config upsert simulated', { key, environment }, 'supabase')
      return { success: true, message: 'Configuration saved in demo mode', configId: 'mock-id' }
    }
    
    const { data, error } = await supabaseAdmin.rpc('upsert_runtime_config', {
      config_key: key,
      config_value: value,
      is_public_param: isPublic,
      env_name: environment,
      description_param: description,
      category_param: category,
      admin_email_param: 'admin@vidgro.com', // Get from auth context
      reason_param: reason
    })
    
    if (error) throw error
    return data[0] || { success: false, message: 'Unknown error' }
  } catch (error) {
    logger.error('Failed to upsert runtime config', error, 'supabase')
    throw error
  }
}

export const deleteRuntimeConfig = async (
  key: string,
  environment = 'production',
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      logger.info('Mock mode - config deletion simulated', { key, environment }, 'supabase')
      return { success: true, message: 'Configuration deleted in demo mode' }
    }
    
    const { data, error } = await supabaseAdmin.rpc('delete_runtime_config', {
      config_key: key,
      env_name: environment,
      admin_email_param: 'admin@vidgro.com', // Get from auth context
      reason_param: reason
    })
    
    if (error) throw error
    return data[0] || { success: false, message: 'Unknown error' }
  } catch (error) {
    logger.error('Failed to delete runtime config', error, 'supabase')
    throw error
  }
}

export const getConfigAuditLogs = async (
  configKey?: string,
  environment?: string,
  daysBack = 30,
  limit = 100
): Promise<ConfigAuditLog[]> => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      logger.warn('Using mock data - Supabase not configured', null, 'supabase')
      return []
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_config_audit_logs', {
      config_key_filter: configKey || null,
      env_filter: environment || null,
      days_back: daysBack,
      limit_count: limit
    })
    
    if (error) throw error
    
    return data?.map(item => ({
      id: item.id,
      configKey: item.config_key,
      environment: item.environment,
      action: item.action,
      oldValue: item.old_value,
      newValue: item.new_value,
      adminEmail: item.admin_email,
      ipAddress: item.ip_address,
      timestamp: item.timestamp,
      reason: item.reason
    })) || []
  } catch (error) {
    logger.error('Failed to fetch config audit logs', error, 'supabase')
    return []
  }
}

export const getClientRuntimeConfig = async (environment = 'production'): Promise<ClientRuntimeConfig | null> => {
  try {
    const config = getSupabaseConfig()
    if (config.url.includes('your-project')) {
      logger.warn('Using mock data - Supabase not configured', null, 'supabase')
      return {
        config: {
          'SUPABASE_URL': 'https://kuibswqfmhhdybttbcoa.supabase.co',
          'ADMOB_APP_ID': 'ca-app-pub-2892152842024866~2841739969',
          'FEATURE_ADS_ENABLED': 'true'
        },
        categories: {
          supabase: { 'SUPABASE_URL': 'https://kuibswqfmhhdybttbcoa.supabase.co' },
          admob: { 'ADMOB_APP_ID': 'ca-app-pub-2892152842024866~2841739969' },
          features: { 'FEATURE_ADS_ENABLED': 'true' }
        },
        environment,
        timestamp: new Date().toISOString()
      }
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_public_runtime_config', {
      env_name: environment
    })
    
    if (error) throw error
    
    const configData: Record<string, string> = {}
    const categories: Record<string, Record<string, string>> = {}
    
    data?.forEach(item => {
      configData[item.key] = item.value
      if (!categories[item.category]) {
        categories[item.category] = {}
      }
      categories[item.category][item.key] = item.value
    })
    
    return {
      config: configData,
      categories,
      environment,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    logger.error('Failed to fetch client runtime config', error, 'supabase')
    return null
  }
}