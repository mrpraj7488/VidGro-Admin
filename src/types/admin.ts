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

export interface ChartDataPoint {
  date: string
  users: number
  videos: number
  coins: number
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

export interface BugReportData {
  newBugs: number
  bugsFixedToday: number
  totalBugs: number
  bugReports: BugReport[]
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

export interface RuntimeConfig {
  id: string
  key: string
  value: string
  isPublic: boolean
  environment: string
  description?: string
  category: string
  createdAt: string
  updatedAt: string
}

export interface ConfigAuditLog {
  id: string
  configKey: string
  environment: string
  action: 'create' | 'update' | 'delete'
  oldValue?: string
  newValue?: string
  adminEmail: string
  ipAddress?: string
  timestamp: string
  reason?: string
}

export interface ClientRuntimeConfig {
  config: Record<string, string>
  categories: Record<string, Record<string, string>>
  environment: string
  timestamp: string
}

export interface SystemEnvironment {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_SUPABASE_SERVICE_ROLE_KEY: string
  VITE_ADMIN_EMAIL: string
  VITE_ADMIN_SECRET_KEY: string
  VITE_APP_NAME: string
  VITE_API_BASE_URL: string
}

export interface AdsConfiguration {
  ADMOB_APP_ID: string
  ADMOB_BANNER_ID: string
  ADMOB_INTERSTITIAL_ID: string
  ADMOB_REWARDED_ID: string
}
