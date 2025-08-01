import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://placeholder-project.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock data for demo purposes
export const mockDashboardStats = {
  totalUsers: 45732,
  activeVideos: 8924,
  totalCoinsDistributed: 892450,
  dailyActiveUsers: 12453,
  revenueThisMonth: 67890,
  userGrowthRate: 12.5
}

export const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  user_id: `user-${i + 1}`,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  coins: Math.floor(Math.random() * 10000),
  is_vip: Math.random() > 0.7,
  created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  last_active: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  videos_posted: Math.floor(Math.random() * 50),
  avatar_url: `https://images.pexels.com/photos/${1000 + i}/pexels-photo-${1000 + i}.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`
}))

export const mockVideos = Array.from({ length: 15 }, (_, i) => ({
  video_id: `video-${i + 1}`,
  title: `Amazing Video ${i + 1}`,
  thumbnail_url: `https://images.pexels.com/photos/${2000 + i}/pexels-photo-${2000 + i}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`,
  user_id: `user-${Math.floor(Math.random() * 20) + 1}`,
  username: `user${Math.floor(Math.random() * 20) + 1}`,
  status: ['active', 'paused', 'completed', 'flagged'][Math.floor(Math.random() * 4)] as any,
  views_count: Math.floor(Math.random() * 100000),
  completion_rate: Math.floor(Math.random() * 100),
  coins_spent: Math.floor(Math.random() * 5000),
  created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}))

export const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  users: Math.floor(Math.random() * 1000) + 500,
  videos: Math.floor(Math.random() * 200) + 100,
  coins: Math.floor(Math.random() * 50000) + 10000
}))

export const mockAnalyticsData = {
  revenueGrowth: 23.5,
  userRetention: 78.2,
  avgCompletionRate: 65.8,
  coinVelocity: 4.2,
  userGrowthData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    newUsers: Math.floor(Math.random() * 200) + 50,
    activeUsers: Math.floor(Math.random() * 800) + 400
  })),
  revenueData: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
    revenue: Math.floor(Math.random() * 50000) + 20000,
    coinSales: Math.floor(Math.random() * 30000) + 10000
  })),
  videoPerformanceData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploads: Math.floor(Math.random() * 100) + 20,
    completions: Math.floor(Math.random() * 80) + 15
  })),
  userSegments: [
    { name: 'Regular Users', value: 65 },
    { name: 'VIP Users', value: 20 },
    { name: 'Content Creators', value: 10 },
    { name: 'Inactive', value: 5 }
  ],
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

export const mockEconomyData = {
  totalCoinsCirculation: 2450000,
  monthlyRevenue: 89500,
  coinVelocity: 3.8,
  activeSpenders: 8924,
  settings: {
    coinPrice: 0.01,
    videoReward: 10,
    referralBonus: 50,
    vipMultiplier: 2.0
  },
  coinFlowData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    inflow: Math.floor(Math.random() * 10000) + 5000,
    outflow: Math.floor(Math.random() * 8000) + 4000
  })),
  revenueData: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
    coinSales: Math.floor(Math.random() * 30000) + 15000,
    subscriptions: Math.floor(Math.random() * 20000) + 10000
  })),
  healthIndicators: [
    { name: 'Coin Inflation Rate', value: '2.3%', target: '<5%', status: 'healthy' as const },
    { name: 'User Spending Rate', value: '78%', target: '>70%', status: 'healthy' as const },
    { name: 'Coin Velocity', value: '3.8x', target: '3-5x', status: 'healthy' as const },
    { name: 'Revenue Growth', value: '12.5%', target: '>10%', status: 'healthy' as const }
  ],
  topSpenders: Array.from({ length: 5 }, (_, i) => ({
    id: `spender-${i + 1}`,
    username: `bigspender${i + 1}`,
    coinsSpent: Math.floor(Math.random() * 50000) + 20000,
    videosPromoted: Math.floor(Math.random() * 100) + 20
  })),
  alerts: [
    {
      title: 'High Coin Velocity',
      description: 'Coin circulation is above normal levels',
      severity: 'medium' as const,
      timestamp: '2 hours ago'
    },
    {
      title: 'Revenue Milestone',
      description: 'Monthly revenue target achieved',
      severity: 'low' as const,
      timestamp: '1 day ago'
    }
  ]
}

export const mockModerationData = {
  pendingCount: 23,
  approvedToday: 156,
  flaggedCount: 8,
  pendingItems: Array.from({ length: 10 }, (_, i) => ({
    id: `mod-item-${i + 1}`,
    title: `Video requiring moderation ${i + 1}`,
    thumbnail: `https://images.pexels.com/photos/${4000 + i}/pexels-photo-${4000 + i}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`,
    username: `user${i + 1}`,
    status: ['pending', 'flagged'][Math.floor(Math.random() * 2)] as any,
    priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
    reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    reportCount: Math.floor(Math.random() * 10) + 1,
    reportReasons: ['Inappropriate Content', 'Spam', 'Copyright'].slice(0, Math.floor(Math.random() * 3) + 1)
  })),
  stats: {
    totalReviewed: 1247,
    approvalRate: 87,
    avgResponseTime: 4.2,
    activeReports: 31
  }
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