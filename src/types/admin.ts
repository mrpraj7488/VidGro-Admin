export interface DashboardStats {
  totalUsers: number
  activeVideos: number
  vipUsers: number
  monthlyRevenue: number
  userGrowthRate: number
  dailyActiveUsers: number
  totalCoinsDistributed: number
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
  banner_ads_enabled: boolean
  interstitial_ads_enabled: boolean
  rewarded_ads_enabled: boolean
  ad_frequency_minutes: number
  revenue_share_percent: number
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
  revenueGrowth: number
  userRetention: number
  avgCompletionRate: number
  coinVelocity: number
  userGrowthData: Array<{
    date: string
    newUsers: number
    activeUsers: number
  }>
  revenueData: Array<{
    month: string
    revenue: number
    coinSales: number
  }>
  videoPerformanceData: Array<{
    date: string
    uploads: number
    completions: number
  }>
  userSegments: Array<{
    name: string
    value: number
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
  stats: {
    totalReported: number
    fixRate: number
    avgResponseTime: number
    criticalBugs: number
  }
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