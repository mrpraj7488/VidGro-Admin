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