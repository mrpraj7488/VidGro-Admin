export interface DashboardStats {
  total_users: number
  active_videos: number
  vip_users: number
  monthly_revenue: number
  total_revenue: number
  user_growth_rate: number
  daily_active_users: number
  coin_transactions: number
  total_coins_distributed: number
  video_completion_rate: number
  average_watch_time: number
  total_transactions: number
  pending_videos: number
}

export interface User {
  id: string
  email: string
  username: string
  coins: number
  is_vip: boolean
  vip_expires_at?: string
  referral_code?: string
  referred_by?: string
  created_at: string
  updated_at: string
  avatar_url?: string
}

export interface Video {
  id: string
  user_id: string
  username: string
  youtube_url: string
  title: string
  views_count: number
  target_views: number
  duration_seconds: number
  coin_reward: number
  coin_cost: number
  status: 'pending' | 'active' | 'paused' | 'completed' | 'on_hold' | 'repromoted' | 'deleted' | 'rejected'
  hold_until?: string
  repromoted_at?: string
  total_watch_time: number
  completion_rate: number
  created_at: string
  updated_at: string
  completed: boolean
  coins_earned_total: number
}

export interface BugReport {
  bug_id: string
  title: string
  description: string
  status: 'new' | 'in_progress' | 'fixed' | 'wont_fix'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reported_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  category: string
}

export interface UserFilters {
  search: string
  vipStatus: 'all' | 'vip' | 'regular'
  minCoins: number
}

export interface VideoFilters {
  search: string
  status: string
  dateRange: [Date | null, Date | null]
}

export interface AnalyticsData {
  dailyActiveUsers: number
  coinTransactions: number
  totalPromoted: number
  videosDeleted: number
  userGrowthData: Array<{
    date: string
    activeUsers: number
  }>
  coinTransactionData: Array<{
    date: string
    transactions: number
    volume: number
  }>
  topVideos: Array<{
    id: string
    title: string
    thumbnail: string
    views: number
    completionRate: number
    coinsEarned: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    value: string
  }>
}

export interface SystemSettings {
  general: {
    platformName: string
    supportEmail: string
    maxVideoSize: number
    allowedVideoFormats: string[]
    maintenanceMode: boolean
  }
  users: {
    registrationEnabled: boolean
    emailVerificationRequired: boolean
    maxCoinsPerUser: number
    vipUpgradePrice: number
    referralReward: number
  }
  videos: {
    maxVideosPerUser: number
    autoModerationEnabled: boolean
    minVideoLength: number
    maxVideoLength: number
    thumbnailRequired: boolean
  }
  economy: {
    coinPrice: number
    videoReward: number
    dailyBonusCoins: number
    vipMultiplier: number
    withdrawalMinimum: number
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    moderationAlerts: boolean
    systemAlerts: boolean
    weeklyReports: boolean
  }
  security: {
    twoFactorRequired: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    ipWhitelist: string[]
  }
}
