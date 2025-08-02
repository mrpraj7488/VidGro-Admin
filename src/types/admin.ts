export interface DashboardStats {
  totalUsers: number
  activeVideos: number
  vipUsers: number
  monthlyRevenue: number
  userGrowthRate: number
}

export interface User {
  id: string
  username: string
  email: string
  coins: number
  is_vip: boolean
  created_at: string
  last_active: string
  videos_posted: number
}

export interface Video {
  id: string
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