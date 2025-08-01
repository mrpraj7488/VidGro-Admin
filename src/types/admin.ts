export interface DashboardStats {
  totalUsers: number
  activeVideos: number
  totalCoinsDistributed: number
  dailyActiveUsers: number
  revenueThisMonth: number
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
  title: string
  thumbnail_url: string
  user_id: string
  username: string
  status: 'active' | 'paused' | 'completed' | 'flagged'
  views_count: number
  completion_rate: number
  coins_spent: number
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

export interface EconomyData {
  totalCoinsCirculation: number
  monthlyRevenue: number
  coinVelocity: number
  activeSpenders: number
  settings: {
    coinPrice: number
    videoReward: number
    referralBonus: number
    vipMultiplier: number
  }
  coinFlowData: Array<{
    date: string
    inflow: number
    outflow: number
  }>
  revenueData: Array<{
    month: string
    coinSales: number
    subscriptions: number
  }>
  healthIndicators: Array<{
    name: string
    value: string
    target: string
    status: 'healthy' | 'warning' | 'critical'
  }>
  topSpenders: Array<{
    id: string
    username: string
    coinsSpent: number
    videosPromoted: number
  }>
  alerts: Array<{
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
    timestamp: string
  }>
}

export interface ModerationData {
  pendingCount: number
  approvedToday: number
  flaggedCount: number
  pendingItems: Array<{
    id: string
    title: string
    thumbnail: string
    username: string
    status: 'pending' | 'approved' | 'rejected' | 'flagged'
    priority: 'high' | 'medium' | 'low'
    reportedAt: string
    reportCount: number
    reportReasons: string[]
  }>
  stats: {
    totalReviewed: number
    approvalRate: number
    avgResponseTime: number
    activeReports: number
  }
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