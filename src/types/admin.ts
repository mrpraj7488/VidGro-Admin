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