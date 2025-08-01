export interface DashboardStats {
  totalUsers: number
  activeVideos: number
  vipUsers: number
  monthlyRevenue: number
  userGrowthRate: number
}

export interface User {
  user_id: string
  username: string
  email: string
  coins: number
  is_vip: boolean
  created_at: string
  last_active: string
  videos_posted: number
  avatar_url?: string
}

export interface Video {
  video_id: string
  user_id: string
  username: string
  video_url: string
  title: string
  status: 'active' | 'completed' | 'hold' | 'repromote' | 'deleted'
  view_criteria: string // "7/40" format
  spent_coins: number
  total_watch_time: number
  completion_rate: number
  refund_amount?: number
  refund_percent?: number
  created_at: string
  thumbnail_url: string
  views_count: number
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

export interface SystemEnvironment {
  EXPO_PUBLIC_SUPABASE_URL: string
  EXPO_PUBLIC_SUPABASE_ANON_KEY: string
  EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: string
  EXPO_PUBLIC_ADMOB_APP_ID: string
  EXPO_PUBLIC_ADMOB_BANNER_ID: string
  EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID: string
  EXPO_PUBLIC_ADMOB_REWARDED_ID: string
}

export interface AdsConfiguration {
  bannerAdsEnabled: boolean
  interstitialAdsEnabled: boolean
  rewardedAdsEnabled: boolean
  adFrequencyMinutes: number
  revenueSharePercent: number
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
  bugReports: BugReport[]
}

export interface SystemSettings {
  environment: SystemEnvironment
  ads: AdsConfiguration
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
}