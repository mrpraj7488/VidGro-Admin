import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://placeholder-project.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock data for demo purposes
export const mockDashboardStats = {
  totalUsers: 45732,
  activeVideos: 8924,
  vipUsers: 3247,
  monthlyRevenue: 89500,
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
  video_id: `VID${String(i + 1).padStart(6, '0')}`,
  user_id: `user-${Math.floor(Math.random() * 20) + 1}`,
  username: `user${Math.floor(Math.random() * 20) + 1}`,
  video_url: `https://example.com/video/${i + 1}.mp4`,
  title: `Amazing Video Content ${i + 1}`,
  thumbnail_url: `https://images.pexels.com/photos/${2000 + i}/pexels-photo-${2000 + i}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`,
  status: ['active', 'completed', 'hold', 'repromote', 'deleted'][Math.floor(Math.random() * 5)] as any,
  view_criteria: `${Math.floor(Math.random() * 50) + 1}/${Math.floor(Math.random() * 100) + 50}`,
  spent_coins: Math.floor(Math.random() * 5000),
  total_watch_time: Math.floor(Math.random() * 10000),
  completion_rate: Math.floor(Math.random() * 100),
  views_count: Math.floor(Math.random() * 100000),
  refund_amount: Math.random() > 0.8 ? Math.floor(Math.random() * 1000) : undefined,
  refund_percent: Math.random() > 0.8 ? Math.floor(Math.random() * 100) : undefined,
  created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
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

export const mockBugReportData = {
  newBugs: 12,
  bugsFixedToday: 8,
  bugReports: Array.from({ length: 15 }, (_, i) => ({
    bug_id: `BUG${String(i + 1).padStart(4, '0')}`,
    title: `Bug Report ${i + 1}: ${['Login Issue', 'Video Upload Error', 'Coin Transaction Failed', 'App Crash', 'UI Glitch'][Math.floor(Math.random() * 5)]}`,
    description: `Detailed description of bug ${i + 1}. This is a sample bug report that describes the issue in detail.`,
    status: ['new', 'in_progress', 'fixed', 'wont_fix'][Math.floor(Math.random() * 4)] as any,
    priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
    reported_by: `user${Math.floor(Math.random() * 100) + 1}`,
    assigned_to: Math.random() > 0.5 ? `dev${Math.floor(Math.random() * 5) + 1}` : undefined,
    category: ['UI/UX', 'Backend', 'Mobile App', 'Payment', 'Video Processing'][Math.floor(Math.random() * 5)],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

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
  }
}