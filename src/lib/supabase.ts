import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Regular client for auth and basic operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000)
  }
})

// Database types
export interface Profile {
  id: string
  username: string
  email: string
  coins: number
  is_vip: boolean
  avatar_url?: string
  referral_code?: string
  referred_by?: string
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
  last_active: string
  videos_posted: number
  fcm_token?: string
}

export interface Video {
  id: string
  user_id: string
  username?: string
  title: string
  description?: string
  youtube_url: string
  youtube_video_id: string
  status: 'pending' | 'active' | 'paused' | 'completed' | 'rejected' | 'repromoted'
  target_views: number
  current_views: number
  views_count: number
  completion_rate: number
  coin_cost: number
  coin_reward: number
  coins_earned_total: number
  total_watch_time: number
  min_watch_duration: number
  created_at: string
  updated_at: string
  completed_at?: string
  promoted_until?: string
  thumbnail_url: string
  video_id: string
  video_url: string
  spent_coins: number
  refund_amount?: number
  refund_percent?: number
}

export interface Transaction {
  id: string
  user_id: string
  type: 'earned' | 'spent' | 'bonus' | 'refund' | 'admin_adjustment'
  amount: number
  description: string
  reference_type?: string
  reference_id?: string
  balance_after: number
  created_at: string
}

export interface AdminProfile {
  id: string
  user_id: string
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

// Real-time subscriptions
export const subscribeToAdminNotifications = (callback: (payload: any) => void) => {
  return supabase
    .channel('admin-notifications')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'profiles' }, 
      callback
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'videos' },
      callback
    )
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      callback
    )
    .subscribe()
}

// Mock data for demo purposes (when Supabase is not configured)
export const mockDashboardStats = {
  totalUsers: 45732,
  activeVideos: 8924,
  vipUsers: 3247,
  monthlyRevenue: 89500,
  userGrowthRate: 12.5,
  dailyActiveUsers: 12453,
  coinTransactions: 8924,
  totalCoinsDistributed: 2500000,
  videoCompletionRate: 78.5,
  averageWatchTime: 145,
  totalTransactions: 156789,
  pendingVideos: 234
}

export const mockUsers: Profile[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i + 1}`,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  coins: Math.floor(Math.random() * 10000),
  is_vip: Math.random() > 0.7,
  created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  last_active: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  videos_posted: Math.floor(Math.random() * 50),
  avatar_url: `https://images.pexels.com/photos/${1000 + i}/pexels-photo-${1000 + i}.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`,
  referral_code: `REF${String(i + 1).padStart(4, '0')}`,
  total_earned: Math.floor(Math.random() * 50000),
  total_spent: Math.floor(Math.random() * 30000)
}))

export const mockVideos: Video[] = Array.from({ length: 15 }, (_, i) => ({
  id: `video-${i + 1}`,
  video_id: `VID${String(i + 1).padStart(6, '0')}`,
  user_id: `user-${Math.floor(Math.random() * 20) + 1}`,
  username: `user${Math.floor(Math.random() * 20) + 1}`,
  video_url: `https://example.com/video/${i + 1}.mp4`,
  youtube_url: `https://youtube.com/watch?v=example${i + 1}`,
  youtube_video_id: `example${i + 1}`,
  title: `Amazing Video Content ${i + 1}`,
  description: `This is a description for video ${i + 1}`,
  thumbnail_url: `https://images.pexels.com/photos/${2000 + i}/pexels-photo-${2000 + i}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`,
  status: ['pending', 'active', 'paused', 'completed', 'rejected', 'repromoted'][Math.floor(Math.random() * 6)] as any,
  target_views: Math.floor(Math.random() * 10000) + 1000,
  current_views: Math.floor(Math.random() * 5000),
  views_count: Math.floor(Math.random() * 100000),
  completion_rate: Math.floor(Math.random() * 100),
  coin_cost: Math.floor(Math.random() * 5000) + 100,
  coin_reward: Math.floor(Math.random() * 100) + 10,
  coins_earned_total: Math.floor(Math.random() * 10000),
  spent_coins: Math.floor(Math.random() * 5000),
  total_watch_time: Math.floor(Math.random() * 10000),
  min_watch_duration: 60,
  refund_amount: Math.random() > 0.8 ? Math.floor(Math.random() * 1000) : undefined,
  refund_percent: Math.random() > 0.8 ? Math.floor(Math.random() * 100) : undefined,
  created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  completed_at: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  promoted_until: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
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

// Mock system settings
export const mockSystemSettings = {
  environment: {
    EXPO_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    EXPO_PUBLIC_ADMOB_APP_ID: 'ca-app-pub-1234567890123456~1234567890',
    EXPO_PUBLIC_ADMOB_BANNER_ID: 'ca-app-pub-1234567890123456/1234567890',
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID: 'ca-app-pub-1234567890123456/1234567890',
    EXPO_PUBLIC_ADMOB_REWARDED_ID: 'ca-app-pub-1234567890123456/1234567890'
  },
  ads: {
    bannerAdsEnabled: true,
    interstitialAdsEnabled: true,
    rewardedAdsEnabled: true,
    adFrequencyMinutes: 5,
    revenueSharePercent: 70
  },
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

// API functions
export const getDashboardStats = async () => {
  try {
    // Check if we're using placeholder URLs
    if (supabaseUrl.includes('placeholder-project')) {
      console.warn('Using mock data - Supabase not configured')
      return mockDashboardStats
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_admin_dashboard_stats')
    if (error) throw error
    return data || mockDashboardStats
  } catch (error) {
    console.warn('Using mock data for dashboard stats:', error)
    return mockDashboardStats
  }
}

export const getUsers = async (limit = 50, offset = 0) => {
  try {
    // Check if we're using placeholder URLs
    if (supabaseUrl.includes('placeholder-project')) {
      console.warn('Using mock data - Supabase not configured')
      return mockUsers
    }
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data || mockUsers
  } catch (error) {
    console.warn('Using mock data for users:', error)
    return mockUsers
  }
}

export const getVideos = async (limit = 50, offset = 0) => {
  try {
    // Check if we're using placeholder URLs
    if (supabaseUrl.includes('placeholder-project')) {
      console.warn('Using mock data - Supabase not configured')
      return mockVideos
    }
    
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    // Transform data to match expected format
    const transformedData = data?.map(video => ({
      ...video,
      username: video.profiles?.username || 'Unknown',
      video_id: video.id,
      video_url: video.youtube_url,
      spent_coins: video.coin_cost
    })) || mockVideos
    
    return transformedData
  } catch (error) {
    console.warn('Using mock data for videos:', error)
    return mockVideos
  }
}

export const adjustUserCoins = async (userId: string, amount: number, reason: string, adminId: string) => {
  try {
    // Check if we're using placeholder URLs
    if (supabaseUrl.includes('placeholder-project')) {
      console.warn('Mock mode - coin adjustment simulated')
      return { success: true, message: 'Coin adjustment simulated in demo mode' }
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
    console.error('Failed to adjust user coins:', error)
    throw error
  }
}

export const updateVideoStatus = async (videoId: string, status: string, adminId: string, reason?: string) => {
  try {
    // Check if we're using placeholder URLs
    if (supabaseUrl.includes('placeholder-project')) {
      console.warn('Mock mode - video status update simulated')
      return { success: true, message: 'Video status update simulated in demo mode' }
    }
    
    const { data, error } = await supabaseAdmin.rpc('admin_update_video_status', {
      video_uuid: videoId,
      new_status: status,
      admin_id: adminId,
      reason
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to update video status:', error)
    throw error
  }
}

export const getRealtimeAnalytics = async () => {
  try {
    // Check if we're using placeholder URLs
    if (supabaseUrl.includes('placeholder-project')) {
      console.warn('Using mock data - Supabase not configured')
      return {
        onlineUsers: Math.floor(Math.random() * 1000) + 500,
        videosWatchedLastHour: Math.floor(Math.random() * 500) + 100,
        coinsEarnedLastHour: Math.floor(Math.random() * 10000) + 1000,
        newUsersToday: Math.floor(Math.random() * 100) + 20,
        activePromotions: Math.floor(Math.random() * 50) + 10
      }
    }
    
    const { data, error } = await supabaseAdmin.rpc('get_realtime_analytics')
    if (error) throw error
    return data
  } catch (error) {
    console.warn('Failed to get realtime analytics:', error)
    return {
      onlineUsers: Math.floor(Math.random() * 1000) + 500,
      videosWatchedLastHour: Math.floor(Math.random() * 500) + 100,
      coinsEarnedLastHour: Math.floor(Math.random() * 10000) + 1000,
      newUsersToday: Math.floor(Math.random() * 100) + 20,
      activePromotions: Math.floor(Math.random() * 50) + 10
    }
  }
}