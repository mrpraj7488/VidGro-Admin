import { create } from 'zustand'
import { getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase'
import { DashboardStats, AnalyticsData, SystemSettings, RuntimeConfig, ConfigAuditLog, ClientRuntimeConfig } from '../types/admin'

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
  status: 'active' | 'completed' | 'on_hold' | 'repromoted' | 'deleted'
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
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  user_id: string
  user_email: string
  created_at: string
  updated_at: string
  assigned_to?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'system' | 'mobile_app'
  steps_to_reproduce?: string
  expected_behavior?: string
  actual_behavior?: string
  browser_info?: string
  device_info?: string
  attachments?: string[]
  source: 'mobile_app' | 'admin_panel'
  mobile_device_info?: {
    platform: string
    version: string
    device_model: string
    app_version: string
  }
}

export interface SystemMetrics {
  totalUsers: number
  totalVideos: number
  totalViews: number
  totalLikes: number
  activeUsers24h: number
  newUsers24h: number
  newVideos24h: number
  revenue24h: number
  serverLoad: number
  databaseConnections: number
  errorRate: number
  uptime: number
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
    severity: 'low' | 'medium' | 'high'
    timestamp: string
  }>
}

export interface VideoFilters {
  search: string
  status: string
}

interface AdminStore {
  // Users
  users: User[]
  usersLoading: boolean
  usersError: string | null
  
  // Videos
  videos: Video[]
  videosLoading: boolean
  videosError: string | null
  // Coin Transactions
  coinTransactions: any[]
  coinTransactionsLoading: boolean
  coinTransactionsStats: any
  
  
  // Bug Reports
  bugReports: BugReport[]
  bugReportsLoading: boolean
  bugReportsError: string | null
  
  // Dashboard Stats
  dashboardStats: DashboardStats | null
  dashboardLoading: boolean
  dashboardError: string | null
  
  // Analytics Data
  analyticsData: AnalyticsData | null
  analyticsLoading: boolean
  analyticsError: string | null
  
  // System Metrics
  fetchCoinTransactions: (filters?: any) => Promise<void>
  systemMetrics: SystemMetrics | null
  metricsLoading: boolean
  metricsError: string | null
  
  // Economy Data
  economyData: EconomyData | null
  economyLoading: boolean
  economyError: string | null

  // System Settings
  systemSettings: SystemSettings | null
  isLoading: boolean

  // Runtime Config
  runtimeConfig: RuntimeConfig[]
  configAuditLogs: ConfigAuditLog[]
  clientConfig: ClientRuntimeConfig | null
  selectedEnvironment: string
  
  // Video Filters
  videoFilters: VideoFilters
  
  // Actions
  fetchUsers: () => Promise<void>
  fetchVideos: () => Promise<void>
  fetchBugReports: () => Promise<void>
  fetchDashboardStats: () => Promise<void>
  fetchAnalytics: (dateRange?: [Date | null, Date | null]) => Promise<void>
  fetchSystemMetrics: () => Promise<void>
  fetchEconomyData: () => Promise<void>
  fetchSystemSettings: () => Promise<void>
  updateSystemSettings: (settings: SystemSettings) => Promise<void>
  // Runtime config actions
  fetchRuntimeConfig: (environment?: string) => Promise<void>
  fetchConfigAuditLogs: (configKey?: string, environment?: string) => Promise<void>
  fetchClientConfig: (environment?: string) => Promise<void>
  saveRuntimeConfig: (
    key: string,
    value: string,
    isPublic: boolean,
    environment?: string,
    description?: string,
    category?: string,
    reason?: string
  ) => Promise<void>
  deleteRuntimeConfigItem: (key: string, environment?: string, reason?: string) => Promise<void>
  clearConfigCache: () => Promise<void>
  setSelectedEnvironment: (env: string) => void
  // removed duplicate declaration
  
  // User Management
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  banUser: (userId: string, reason: string) => Promise<void>
  unbanUser: (userId: string) => Promise<void>
  adjustUserCoins: (userId: string, amount: number, reason: string) => Promise<void>
  toggleUserVip: (userId: string) => Promise<void>
  
  // Video Management
  approveVideo: (videoId: string) => Promise<void>
  rejectVideo: (videoId: string, reason: string) => Promise<void>
  deleteVideo: (videoId: string, reason?: string) => Promise<void>
  
  // Bug Report Management
  updateBugReport: (reportId: string, updates: Partial<BugReport>) => Promise<void>
  assignBugReport: (reportId: string, assigneeId: string) => Promise<void>
  
  // Economy Management
  updateCoinSettings: (settings: EconomyData['settings']) => Promise<void>
  
  // Utility Functions
  copyToClipboard: (text: string) => Promise<void>
  
  // Bulk Operations
  sendBulkNotification: (userIds: string[], message: string) => Promise<void>
  bulkDeleteUsers: (userIds: string[]) => Promise<void>
  bulkBanUsers: (userIds: string[], reason: string) => Promise<void>
  
  // Filters
  userFilters: {
    search: string
    vipStatus: 'all' | 'vip' | 'regular'
    minCoins: number
  }
  setUserFilters: (filters: Partial<AdminStore['userFilters']>) => void
  setVideoFilters: (filters: Partial<VideoFilters>) => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  users: [],
  usersLoading: false,
  usersError: null,
  
  videos: [],
  videosLoading: false,
  videosError: null,
  
  bugReports: [],
  bugReportsLoading: false,
  bugReportsError: null,
  
  dashboardStats: null,
  dashboardLoading: false,
  dashboardError: null,
  
  analyticsData: null,
  analyticsLoading: false,
  analyticsError: null,
  
  systemMetrics: null,
  metricsLoading: false,
  metricsError: null,
  
  economyData: null,
  economyLoading: false,
  economyError: null,

  // System Settings state
  systemSettings: null,
  isLoading: false,

  // Runtime Config state
  runtimeConfig: [],
  configAuditLogs: [],
  clientConfig: null,
  selectedEnvironment: 'production',
  
  videoFilters: {
    search: '',
    status: 'all'
  },
  
  userFilters: {
    search: '',
    vipStatus: 'all',
    minCoins: 0
  },

  // Fetch Dashboard Stats
  fetchDashboardStats: async () => {
    set({ dashboardLoading: true, dashboardError: null })
    try {
      console.log('🔍 fetchDashboardStats: Starting...')
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        console.error('❌ fetchDashboardStats: Supabase Admin not initialized')
        throw new Error('Supabase not initialized')
      }
      console.log('✅ fetchDashboardStats: Supabase Admin client created')
      
      // Fetch data from Supabase with safe selectors (avoid schema coupling)
      console.log('🔍 fetchDashboardStats: Fetching data from tables...')
      const [usersResult, videosResult, transactionsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('videos').select('*'),
        supabase.from('transactions').select('*')
      ])

      console.log('🔍 fetchDashboardStats: Query results:', {
        users: usersResult.data?.length || 0,
        videos: videosResult.data?.length || 0,
        transactions: transactionsResult.data?.length || 0,
        usersError: usersResult.error,
        videosError: videosResult.error,
        transactionsError: transactionsResult.error
      })

      if (usersResult.error) throw usersResult.error
      if (videosResult.error) throw videosResult.error
      if (transactionsResult.error) throw transactionsResult.error

      const users: Array<Record<string, any>> = usersResult.data || []
      const videos: Array<Record<string, any>> = videosResult.data || []
      const transactions: Array<Record<string, any>> = transactionsResult.data || []

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      const totalUsers = users.length

      const resolveStatus = (video: Record<string, any>): string | undefined => {
        return (
          (typeof video.status === 'string' && video.status) ||
          (typeof video.state === 'string' && video.state) ||
          (typeof video.video_status === 'string' && video.video_status) ||
          undefined
        )
      }
      const activeVideos = videos.filter(v => resolveStatus(v) === 'active').length

      const isVip = (user: Record<string, any>): boolean => {
        const v = user.is_vip ?? user.vip_status ?? user.isVip ?? false
        if (typeof v === 'boolean') return v
        if (typeof v === 'number') return v > 0
        if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1'
        return false
      }
      const vipUsers = users.filter(isVip).length
      
      const monthlyTransactions = transactions.filter(t => {
        const created = t.created_at ? new Date(t.created_at) : null
        const type = (t.type || t.transaction_type || '').toString()
        return (!!created && created >= monthStart) && (type === 'purchase' || type === 'buy' || type === 'credit')
      })
      const monthlyRevenue = monthlyTransactions.reduce((sum, t) => {
        const amount = Number(t.amount ?? t.value ?? 0)
        return sum + (Number.isFinite(amount) ? amount : 0)
      }, 0)
      
      const userGrowthRate = users.filter(u => {
        const created = u.created_at ? new Date(u.created_at) : null
        return !!created && created >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }).length / Math.max(totalUsers, 1) * 100

      const dailyActiveUsers = users.filter(u => {
        const lastLogin = u.last_login || u.last_active || u.updated_at
        const d = lastLogin ? new Date(lastLogin) : null
        return !!d && d >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }).length

      const dailyTransactions = transactions.filter(t => {
        const created = t.created_at ? new Date(t.created_at) : null
        return !!created && created >= dayStart
      }).length

      const totalCoinsDistributed = users.reduce((sum, u) => {
        const coins = Number(u.coins ?? u.total_coins ?? 0)
        return sum + (Number.isFinite(coins) ? coins : 0)
      }, 0)
      
      const pendingVideos = videos.filter(v => resolveStatus(v) === 'pending').length
      
      // Calculate video completion rate from actual data
      const completedVideos = videos.filter(v => resolveStatus(v) === 'completed')
      const videoCompletionRate = videos.length > 0 
        ? (completedVideos.length / videos.length) * 100 
        : 0
      
      // Calculate average watch time from video data
      const totalWatchTime = videos.reduce((sum, v) => {
        const watchTime = Number(v.total_watch_time ?? v.watch_time ?? 0)
        return sum + (Number.isFinite(watchTime) ? watchTime : 0)
      }, 0)
      const averageWatchTime = videos.length > 0 ? totalWatchTime / videos.length : 0

      const stats: DashboardStats = {
        total_users: totalUsers,
        active_videos: activeVideos,
        vip_users: vipUsers,
        monthly_revenue: monthlyRevenue,
        user_growth_rate: userGrowthRate,
        daily_active_users: dailyActiveUsers,
        coin_transactions: dailyTransactions,
        total_coins_distributed: totalCoinsDistributed,
        video_completion_rate: videoCompletionRate,
        average_watch_time: averageWatchTime,
        total_transactions: transactions.length,
        pending_videos: pendingVideos
      }

      console.log('✅ fetchDashboardStats: Calculated stats:', stats)
      set({ dashboardStats: stats, dashboardLoading: false })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      const emptyStats: DashboardStats = {
        total_users: 0,
        active_videos: 0,
        vip_users: 0,
        monthly_revenue: 0,
        user_growth_rate: 0,
        daily_active_users: 0,
        coin_transactions: 0,
        total_coins_distributed: 0,
        video_completion_rate: 0,
        average_watch_time: 0,
        total_transactions: 0,
        pending_videos: 0
      }

      set({ 
        dashboardStats: emptyStats,
        dashboardError: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        dashboardLoading: false 
      })
    }
  },

  // Fetch Economy Data
  fetchEconomyData: async () => {
    set({ economyLoading: true, economyError: null })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      // Fetch real economy data from Supabase
      const [usersResult, videosResult, transactionsResult, settingsResult] = await Promise.all([
        supabase.from('profiles').select('id, username, coins, created_at'),
        supabase.from('videos').select('id, coin_cost, coin_reward, status, created_at, user_id'),
        supabase.from('transactions').select('amount, type, created_at'),
        supabase.from('system_settings').select('*').eq('category', 'economy')
      ])

      if (usersResult.error) throw usersResult.error
      if (videosResult.error) throw videosResult.error
      if (transactionsResult.error) throw transactionsResult.error

      const users = usersResult.data || []
      const videos = videosResult.data || []
      const transactions = transactionsResult.data || []
      const settings = settingsResult.data || []

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Calculate economy metrics from real data
      const totalCoinsCirculation = users.reduce((sum, u) => sum + (u.coins || 0), 0)
      const monthlyRevenue = transactions
        .filter(t => new Date(t.created_at) >= monthStart && t.type === 'purchase')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      
      const activeSpenders = users.filter(u => u.coins > 0).length
      
      // Get settings from Supabase
      const economySettings = settings.length > 0 ? settings[0] : {
        coinPrice: 0,
        videoReward: 0,
        referralBonus: 0,
        vipMultiplier: 0
      }

      // Generate real chart data from transactions
      const coinFlowData = []
      const revenueData = []
      
      // Last 30 days of data
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayTransactions = transactions.filter(t => 
          new Date(t.created_at).toISOString().split('T')[0] === dateStr
        )
        
        const inflow = dayTransactions
          .filter(t => t.type === 'purchase')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        
        const outflow = dayTransactions
          .filter(t => t.type === 'spend')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        
        coinFlowData.push({ date: dateStr, inflow, outflow })
      }

      // Last 12 months of revenue data
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.created_at)
          return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear()
        })
        
        const coinSales = monthTransactions
          .filter(t => t.type === 'purchase')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        
        const subscriptions = monthTransactions
          .filter(t => t.type === 'subscription')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        
        revenueData.push({ month: monthStr, coinSales, subscriptions })
      }

      // Calculate health indicators from real data
      const healthIndicators: Array<{
        name: string
        value: string
        target: string
        status: 'healthy' | 'warning' | 'critical'
      }> = [
        {
          name: 'Coin Distribution',
          value: `${Math.round((totalCoinsCirculation / Math.max(users.length, 1)) * 100) / 100} avg`,
          target: 'Balanced',
          status: totalCoinsCirculation > 0 ? 'healthy' : 'warning'
        },
        {
          name: 'Monthly Revenue',
          value: `$${monthlyRevenue.toFixed(2)}`,
          target: 'Growing',
          status: monthlyRevenue > 0 ? 'healthy' : 'warning'
        },
        {
          name: 'Active Users',
          value: `${activeSpenders}`,
          target: '> 0',
          status: activeSpenders > 0 ? 'healthy' : 'critical'
        }
      ]

      // Get top spenders from real data
      const topSpenders = users
        .filter(u => u.coins > 0)
        .sort((a, b) => (b.coins || 0) - (a.coins || 0))
        .slice(0, 5)
        .map(user => ({
          id: user.id,
          username: user.username,
          coinsSpent: user.coins || 0,
          videosPromoted: videos.filter(v => v.user_id === user.id).length
        }))

      // Generate alerts based on real data
      const alerts = []
      if (totalCoinsCirculation === 0) {
        alerts.push({
          title: 'No Coins in Circulation',
          description: 'The platform has no coins distributed to users',
          severity: 'high' as const,
          timestamp: now.toISOString()
        })
      }
      
      if (monthlyRevenue === 0) {
        alerts.push({
          title: 'No Monthly Revenue',
          description: 'No revenue generated this month',
          severity: 'medium' as const,
          timestamp: now.toISOString()
        })
      }

      const economy: EconomyData = {
        totalCoinsCirculation,
        monthlyRevenue,
        coinVelocity: transactions.length,
        activeSpenders,
        settings: economySettings,
        coinFlowData,
        revenueData,
        healthIndicators,
        topSpenders,
        alerts
      }

      set({ economyData: economy, economyLoading: false })
    } catch (error) {
      console.error('Error fetching economy data:', error)
      set({ 
        economyError: error instanceof Error ? error.message : 'Failed to fetch economy data',
        economyLoading: false 
      })
    }
  },

  // Fetch System Settings
  fetchSystemSettings: async () => {
    set({ isLoading: true })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) throw new Error('Supabase not initialized')

      const { data, error } = await supabase.from('system_settings').select('*')
      if (error) throw error

      // Transform rows into SystemSettings shape
      const settings: SystemSettings = {
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

      // Optionally merge values from DB rows if present
      if (Array.isArray(data)) {
        for (const row of data) {
          // expecting rows like { category: 'general', key: 'platformName', value: 'VidGro' }
          const category = (row.category || '').toLowerCase()
          const key = row.key
          const value = row.value
          if (settings[category as keyof SystemSettings] && key in (settings[category as keyof SystemSettings] as Record<string, any>)) {
            const catObj = settings[category as keyof SystemSettings] as Record<string, any>
            if (typeof catObj[key] === 'number') {
              const numeric = Number(value)
              catObj[key] = Number.isNaN(numeric) ? catObj[key] : numeric
            } else if (typeof catObj[key] === 'boolean') {
              catObj[key] = String(value).toLowerCase() === 'true'
            } else if (Array.isArray(catObj[key])) {
              try {
                const parsed = JSON.parse(value)
                if (Array.isArray(parsed)) catObj[key] = parsed
              } catch {}
            } else {
              catObj[key] = value
            }
          }
        }
      }

      set({ systemSettings: settings, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch system settings:', error)
      set({ isLoading: false, systemSettings: null })
    }
  },

  // Update System Settings (persist minimal subset)
  updateSystemSettings: async (settings: SystemSettings) => {
    set({ isLoading: true })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) throw new Error('Supabase Admin not initialized')

      // Upsert a few representative keys
      const rows: Array<{ category: string; key: string; value: string }> = [
        { category: 'general', key: 'platformName', value: settings.general.platformName },
        { category: 'general', key: 'supportEmail', value: settings.general.supportEmail },
        { category: 'users', key: 'registrationEnabled', value: String(settings.users.registrationEnabled) },
        { category: 'economy', key: 'coinPrice', value: String(settings.economy.coinPrice) }
      ]

      const { error } = await supabase.from('system_settings').upsert(rows, { onConflict: 'category,key' })
      if (error) throw error

      set({ systemSettings: settings, isLoading: false })
    } catch (error) {
      console.error('Failed to update system settings:', error)
      set({ isLoading: false })
    }
  },

  // Fetch Runtime Config from Supabase
  fetchRuntimeConfig: async (environment) => {
    try {
      const supabase = getSupabaseAdminClient() // Use admin client to bypass RLS
      if (!supabase) {
        throw new Error('Supabase Admin not initialized')
      }
      
      const currentEnv = environment || get().selectedEnvironment
      
      // Fetch runtime config from the runtime_config table
      const { data, error } = await supabase
        .from('runtime_config')
        .select('id, key, value, is_public, environment, description, category, created_at, updated_at')
        .eq('environment', currentEnv)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      
      // Transform the data to match our interface
      const transformedConfig = (data || []).map((item: any) => ({
        id: item.id,
        key: item.key,
        value: item.value,
        isPublic: item.is_public,
        environment: item.environment,
        description: item.description || '',
        category: item.category || 'general',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))

      set({
        runtimeConfig: transformedConfig,
        selectedEnvironment: currentEnv
      })
    } catch (error) {
      console.error('Failed to fetch runtime config:', error)
      set({ runtimeConfig: [] })
    }
  },

  fetchConfigAuditLogs: async (_configKey, _environment) => {
    try {
      set({ configAuditLogs: [] })
    } catch (error) {
      console.error('Failed to fetch config audit logs:', error)
      set({ configAuditLogs: [] })
    }
  },

  fetchClientConfig: async (environment) => {
    try {
      const supabase = getSupabaseAdminClient() // Use admin client to bypass RLS
      if (!supabase) {
        throw new Error('Supabase Admin not initialized')
      }
      
      const env = environment || get().selectedEnvironment
      
      // Fetch public runtime config for client
      const { data, error } = await supabase
        .from('runtime_config')
        .select('id, key, value, is_public, environment, description, category, created_at, updated_at')
        .eq('environment', env)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      
      // Transform data into config object and categories
      const config: Record<string, string> = {}
      const categories: Record<string, Record<string, string>> = {}
      
      (data || []).forEach((item: any) => {
        config[item.key] = item.value
        const category = item.category || 'general'
        if (!categories[category]) {
          categories[category] = {}
        }
        categories[category][item.key] = item.value
      })

      const clientConfig: ClientRuntimeConfig = {
        config,
        categories,
        environment: env,
        timestamp: new Date().toISOString()
      }
      
      set({ clientConfig: clientConfig })
    } catch (error) {
      console.error('Failed to fetch client config:', error)
      set({ clientConfig: null })
    }
  },

  saveRuntimeConfig: async (key, value, isPublic, environment, description, category) => {
    try {
      // Optimistic local update so UI works in Vite-only dev
      const existing = get().runtimeConfig
      const idx = existing.findIndex(c => c.key === key)
      const updated: RuntimeConfig = {
        id: key,
        key,
        value,
        isPublic,
        environment: environment || get().selectedEnvironment,
        description: description || '',
        category: category || 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (idx >= 0) {
        existing[idx] = updated
        set({ runtimeConfig: [...existing] })
      } else {
        set({ runtimeConfig: [...existing, updated] })
      }
    } catch (error) {
      console.error('Failed to save runtime config (local):', error)
    }
  },

  deleteRuntimeConfigItem: async (key) => {
    try {
      const remaining = get().runtimeConfig.filter(c => c.key !== key)
      set({ runtimeConfig: remaining })
    } catch (error) {
      console.error('Failed to delete runtime config (local):', error)
    }
  },

  clearConfigCache: async () => {
    // No-op in Vite-only dev
  },

  setSelectedEnvironment: (env: string) => {
    set({ selectedEnvironment: env })
  },

  // (deduped at bottom)

  // Update Coin Settings
  updateCoinSettings: async (settings: EconomyData['settings']) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) throw new Error('Supabase not initialized')
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          category: 'economy',
          settings: settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Refresh economy data
      await get().fetchEconomyData()
    } catch (error) {
      console.error('Error updating coin settings:', error)
      throw error
    }
  },

  // Copy to Clipboard
  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  },

  // Set Video Filters
  setVideoFilters: (filters: Partial<VideoFilters>) => {
    set(state => ({ videoFilters: { ...state.videoFilters, ...filters } }))
  },

  // Fetch Analytics Data
  fetchAnalytics: async (dateRange?: [Date | null, Date | null]) => {
    set({ analyticsLoading: true, analyticsError: null })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const startDate = dateRange?.[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = dateRange?.[1] || new Date()

      // Fetch real analytics data from Supabase with error handling
      console.log('Fetching analytics data...')
      
      let users: any[] = []
      let videos: any[] = []
      let transactions: any[] = []
      let activities: any[] = []

      try {
        const usersResult = await supabase.from('profiles').select('id, created_at')
        if (!usersResult.error) {
          users = usersResult.data || []
        }
      } catch (e) {
        console.warn('Could not fetch profiles for analytics:', e)
      }

      try {
        const videosResult = await supabase.from('videos').select('id, title, views_count, coin_reward, created_at, status, completion_rate')
        if (!videosResult.error) {
          videos = videosResult.data || []
        }
      } catch (e) {
        console.warn('Could not fetch videos for analytics:', e)
      }

      try {
        const transactionsResult = await supabase.from('transactions').select('id, amount, type, created_at')
        if (!transactionsResult.error) {
          transactions = transactionsResult.data || []
        }
      } catch (e) {
        console.warn('Could not fetch transactions for analytics:', e)
      }

      try {
        const activitiesResult = await supabase.from('admin_logs').select('action, details, created_at').order('created_at', { ascending: false }).limit(10)
        if (!activitiesResult.error) {
          activities = activitiesResult.data || []
        }
      } catch (e) {
        console.warn('Could not fetch admin_logs for analytics:', e)
      }

      console.log('Analytics results:', { users, videos, transactions, activities })

      // Calculate daily active users for the date range
      const userGrowthData = []
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        
        // Use created_at since last_login doesn't exist in profiles table
        const activeUsers = users.filter(u => 
          u.created_at && new Date(u.created_at) >= dayStart && new Date(u.created_at) < dayEnd
        ).length

        userGrowthData.push({
          date: currentDate.toISOString().split('T')[0],
          activeUsers
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Calculate coin transaction data
      const coinTransactionData = []
      const currentDate2 = new Date(startDate)
      while (currentDate2 <= endDate) {
        const dayStart = new Date(currentDate2.getFullYear(), currentDate2.getMonth(), currentDate2.getDate())
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        
        const dayTransactions = transactions.filter(t => 
          new Date(t.created_at) >= dayStart && new Date(t.created_at) < dayEnd
        )

        coinTransactionData.push({
          date: currentDate2.toISOString().split('T')[0],
          transactions: dayTransactions.length,
          volume: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
        })

        currentDate2.setDate(currentDate2.getDate() + 1)
      }

      // Get top videos
      const topVideos = videos
        .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
        .slice(0, 5)
        .map(video => ({
          id: video.id,
          title: video.title,
          thumbnail: '', // No thumbnail_url in new interface
          views: video.views_count || 0,
          completionRate: video.completion_rate || 0,
          coinsEarned: video.coin_reward || 0
        }))

      // Format recent activities
      const recentActivity = activities.map(activity => ({
        type: activity.action,
        description: activity.details?.description || activity.action,
        timestamp: activity.created_at,
        value: activity.details?.value || ''
      }))

      const analytics: AnalyticsData = {
        dailyActiveUsers: users.filter((u: any) => 
          u.created_at && new Date(u.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        coinTransactions: transactions.filter((t: any) => 
          new Date(t.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        totalPromoted: videos.filter((v: any) => v.status === 'active').length,
        videosDeleted: videos.filter((v: any) => v.status === 'deleted').length,
        userGrowthData,
        coinTransactionData,
        topVideos,
        recentActivity
      }

      set({ analyticsData: analytics, analyticsLoading: false })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      set({ 
        analyticsError: error instanceof Error ? error.message : 'Failed to fetch analytics',
        analyticsLoading: false 
      })
    }
  },

  // Fetch Users
  fetchUsers: async () => {
    set({ usersLoading: true, usersError: null })
    try {
      console.log('🔍 fetchUsers: Starting...')
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        console.error('❌ fetchUsers: Supabase Admin not initialized')
        throw new Error('Supabase Admin not initialized')
      }
      console.log('✅ fetchUsers: Supabase Admin client created')
      
      console.log('🔍 fetchUsers: Executing query...')
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          username,
          coins,
          is_vip,
          vip_expires_at,
          referral_code,
          referred_by,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      console.log('🔍 fetchUsers: Query result:', { data, error })
      if (error) {
        console.error('❌ fetchUsers: Query error:', error)
        throw error
      }

      const validUsers = (data || []).filter(user => 
        user && 
        user.id && 
        user.username && 
        user.email
      )

      set({ users: validUsers, usersLoading: false })
    } catch (error) {
      set({ 
        usersError: error instanceof Error ? error.message : 'Failed to fetch users',
        usersLoading: false 
      })
    }
  },

  // Fetch Videos
  fetchVideos: async () => {
    set({ videosLoading: true, videosError: null })
    try {
      console.log('🔍 fetchVideos: Starting...')
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        console.error('❌ fetchVideos: Supabase Admin not initialized')
        throw new Error('Supabase Admin not initialized')
      }
      console.log('✅ fetchVideos: Supabase Admin client created')
      
      // Fetch videos and users separately to get email information
      const { data, error } = await supabase
        .from('videos')
        .select('id, user_id, youtube_url, title, views_count, target_views, duration_seconds, coin_reward, coin_cost, status, hold_until, repromoted_at, total_watch_time, completion_rate, created_at, updated_at, completed, coins_earned_total')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get user emails for the videos
      const userIds = [...new Set((data || []).map(v => v.user_id).filter(Boolean))]
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, username')
        .in('id', userIds)

      const userMap = new Map()
      if (!usersError && usersData) {
        usersData.forEach(user => {
          userMap.set(user.id, { email: user.email, username: user.username })
        })
      }

      // Transform the data to match our interface
      const transformedVideos = (data || []).map((video: any) => ({
        ...video,
        username: userMap.get(video.user_id)?.username || 'Unknown User',
        userEmail: userMap.get(video.user_id)?.email || 'Unknown Email'
      }))

      // Filter out any null or undefined entries and ensure required fields exist
      const validVideos = transformedVideos.filter(video => 
        video && 
        video.id && 
        video.title
      )

      set({ videos: validVideos, videosLoading: false })
    } catch (error) {
      console.error('Error fetching videos:', error)
      set({ 
        videosError: error instanceof Error ? error.message : 'Failed to fetch videos',
        videosLoading: false 
      })
    }
  },

  // Fetch Bug Reports
  fetchBugReports: async () => {
    set({ bugReportsLoading: true, bugReportsError: null })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ bugReports: data || [], bugReportsLoading: false })
    } catch (error) {
      console.error('Error fetching bug reports:', error)
      set({ 
        bugReportsError: error instanceof Error ? error.message : 'Failed to fetch bug reports',
        bugReportsLoading: false 
      })
    }
  },

  // Fetch System Metrics
  fetchSystemMetrics: async () => {
    set({ metricsLoading: true, metricsError: null })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at')

      if (usersError) throw usersError

      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, views_count, created_at')

      if (videosError) throw videosError

      // Calculate metrics from actual data
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const totalUsers = usersData?.length || 0
      const totalVideos = videosData?.length || 0
      const totalViews = videosData?.reduce((sum: number, video: any) => sum + (video.views_count || 0), 0) || 0
      const totalLikes = 0 // TODO: Add likes field to videos table

      const newUsers24h = usersData?.filter((user: any) => 
        new Date(user.created_at) >= yesterday
      ).length || 0

      const newVideos24h = videosData?.filter((video: any) => 
        new Date(video.created_at) >= yesterday
      ).length || 0

      const activeUsers24h = 0 // Not tracked currently

      const metrics: SystemMetrics = {
        totalUsers,
        totalVideos,
        totalViews,
        totalLikes,
        activeUsers24h,
        newUsers24h,
        newVideos24h,
        revenue24h: 0,
        serverLoad: 0,
        databaseConnections: 0,
        errorRate: 0,
        uptime: 0
      }

      set({ systemMetrics: metrics, metricsLoading: false })
    } catch (error) {
      console.error('Error fetching system metrics:', error)
      set({ 
        metricsError: error instanceof Error ? error.message : 'Failed to fetch system metrics',
        metricsLoading: false 
      })
    }
  },

  // Update User
  updateUser: async (userId: string, updates: Partial<User>) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) throw error

      // Refresh users list
      await get().fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Ban User
  banUser: async (userId: string, reason: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: true, 
          ban_reason: reason 
        })
        .eq('id', userId)

      if (error) throw error

      // Refresh users list
      await get().fetchUsers()
    } catch (error) {
      console.error('Error banning user:', error)
      throw error
    }
  },

  // Unban User
  unbanUser: async (userId: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: false, 
          ban_reason: null 
        })
        .eq('id', userId)

      if (error) throw error

      // Refresh users list
      await get().fetchUsers()
    } catch (error) {
      console.error('Error unbanning user:', error)
      throw error
    }
  },

  // Adjust User Coins
  adjustUserCoins: async (userId: string, amount: number, reason: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const user = get().users.find(u => u.id === userId)
      if (!user) throw new Error('User not found')

      const newCoins = Math.max(0, user.coins + amount)
      
      const { error } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', userId)

      if (error) throw error

      // Log the coin adjustment
      await supabase.from('admin_logs').insert({
        admin_id: 'admin', // TODO: Get actual admin ID from auth context
        action: 'adjust_coins',
        target_type: 'user',
        target_id: userId,
        old_values: { coins: user.coins },
        new_values: { coins: newCoins },
        details: { reason, amount }
      })

      // Refresh users list
      await get().fetchUsers()
    } catch (error) {
      console.error('Error adjusting user coins:', error)
      throw error
    }
  },

  // Toggle User VIP Status
  toggleUserVip: async (userId: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const user = get().users.find(u => u.id === userId)
      if (!user) throw new Error('User not found')

      const newVipStatus = !user.is_vip
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_vip: newVipStatus })
        .eq('id', userId)

      if (error) throw error

      // Log the VIP status change
      await supabase.from('admin_logs').insert({
        admin_id: 'admin', // TODO: Get actual admin ID from auth context
        action: 'toggle_vip',
        target_type: 'user',
        target_id: userId,
        old_values: { is_vip: user.is_vip },
        new_values: { is_vip: newVipStatus },
        details: { action: newVipStatus ? 'enabled' : 'disabled' }
      })

      // Refresh users list
      await get().fetchUsers()
    } catch (error) {
      console.error('Error toggling user VIP status:', error)
      throw error
    }
  },

  // Approve Video
  approveVideo: async (videoId: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { error } = await supabase
        .from('videos')
        .update({ status: 'approved' })
        .eq('id', videoId)

      if (error) throw error

      // Refresh videos list
      await get().fetchVideos()
    } catch (error) {
      console.error('Error approving video:', error)
      throw error
    }
  },

  // Reject Video
  rejectVideo: async (videoId: string, reason: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { error } = await supabase
        .from('videos')
        .update({ 
          status: 'rejected',
          rejection_reason: reason 
        })
        .eq('id', videoId)

      if (error) throw error

      // Refresh videos list
      await get().fetchVideos()
    } catch (error) {
      console.error('Error rejecting video:', error)
      throw error
    }
  },

  // Delete Video
  deleteVideo: async (videoId: string, reason?: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      // Get video details before deletion for logging
      const { data: videoData, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single()

      if (fetchError) throw fetchError

      // Log the deletion with reason
      await supabase.from('admin_logs').insert({
        admin_id: 'admin', // TODO: Get actual admin ID from auth context
        action: 'delete_video',
        target_type: 'video',
        target_id: videoId,
        old_values: videoData,
        new_values: { status: 'deleted' },
        details: { 
          reason: reason || 'Deleted by admin',
          video_title: videoData?.title,
          user_id: videoData?.user_id,
          coin_cost: videoData?.coin_cost
        }
      })

      // Update video status to deleted instead of hard delete
      const { error } = await supabase
        .from('videos')
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deletion_reason: reason || 'Deleted by admin'
        })
        .eq('id', videoId)

      if (error) throw error

      // Refresh videos list
      await get().fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
      throw error
    }
  },

  // Update Bug Report
  updateBugReport: async (reportId: string, updates: Partial<BugReport>) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { error } = await supabase
        .from('bug_reports')
        .update(updates)
        .eq('id', reportId)

      if (error) throw error

      // Refresh bug reports list
      await get().fetchBugReports()
    } catch (error) {
      console.error('Error updating bug report:', error)
      throw error
    }
  },

  // Assign Bug Report
  assignBugReport: async (reportId: string, assigneeId: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }
      
      const { error } = await supabase
        .from('bug_reports')
        .update({ assigned_to: assigneeId })
        .eq('id', reportId)

      if (error) throw error

      // Refresh bug reports list
      await get().fetchBugReports()
    } catch (error) {
      console.error('Error assigning bug report:', error)
      throw error
    }
  },

  // Send Bulk Notification
  sendBulkNotification: async (userIds: string[], message: string) => {
    try {
      // TODO: Implement actual bulk notification system
      // This should integrate with your notification service
      console.log('Sending bulk notification to users:', userIds, 'Message:', message)
      
      // For now, just log the action
      // In production, this would send actual notifications
    } catch (error) {
      console.error('Error sending bulk notification:', error)
      throw error
    }
  },

  // Bulk Delete Users
  bulkDeleteUsers: async (userIds: string[]) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase Admin not initialized')
      }
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', userIds)

      if (error) throw error

      // Refresh users list
      await get().fetchUsers()
    } catch (error) {
      console.error('Error bulk deleting users:', error)
      throw error
    }
  },

  // Bulk Ban Users
  bulkBanUsers: async (userIds: string[], reason: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase Admin not initialized')
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: true, 
          ban_reason: reason 
        })
        .in('id', userIds)

      if (error) throw error

      // Refresh users list
      await get().fetchUsers()
    } catch (error) {
      console.error('Error bulk banning users:', error)
      throw error
    }
  },

  // Set User Filters
  setUserFilters: (filters: Partial<AdminStore['userFilters']>) => {
    set(state => ({ userFilters: { ...state.userFilters, ...filters } }))
  }
}))
