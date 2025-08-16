import { create } from 'zustand'
import { 
  DashboardStats, 
  User, 
  Video, 
  UserFilters, 
  VideoFilters, 
  ChartDataPoint, 
  AnalyticsData,
  BugReportData,
  SystemSettings,
  RuntimeConfig,
  ConfigAuditLog,
  ClientRuntimeConfig
} from '../types/admin'
import { getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

interface AdminState {
  // Dashboard
  dashboardStats: DashboardStats | null
  dashboardLoading: boolean
  chartData: ChartDataPoint[]
  
  // Users
  users: User[]
  usersLoading: boolean
  usersError: string | null
  userFilters: UserFilters
  
  // Videos
  videos: Video[]
  videosLoading: boolean
  videoFilters: VideoFilters
  
  // Analytics
  analyticsData: AnalyticsData | null
  analyticsLoading: boolean
  
  // Bug Reports
  bugReportData: BugReportData | null
  bugReportsLoading: boolean
  
  // System Settings
  systemSettings: SystemSettings | null
  settingsLoading: boolean
  
  // Runtime Configuration
  runtimeConfig: RuntimeConfig[]
  configAuditLogs: ConfigAuditLog[]
  clientConfig: ClientRuntimeConfig | null
  selectedEnvironment: string
  isLoading: boolean
  
  // Actions
  fetchDashboardStats: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchVideos: () => Promise<void>
  fetchAnalytics: (dateRange: [Date | null, Date | null]) => Promise<void>
  fetchBugReports: () => Promise<void>
  fetchSystemSettings: () => Promise<void>
  fetchRuntimeConfig: (environment: string) => Promise<void>
  fetchConfigAuditLogs: (configKey?: string, environment?: string) => Promise<void>
  fetchClientConfig: (environment: string) => Promise<void>
  
  // User actions
  setUserFilters: (filters: Partial<UserFilters>) => void
  adjustUserCoins: (userId: string, amount: number, reason: string) => Promise<void>
  toggleUserVip: (userId: string) => Promise<void>
  
  // Video actions
  setVideoFilters: (filters: Partial<VideoFilters>) => void
  deleteVideo: (videoId: string, reason: string) => Promise<void>
  
  // Settings actions
  updateSystemSettings: (settings: SystemSettings) => Promise<void>
  
  // Runtime config actions
  saveRuntimeConfig: (key: string, value: string, isPublic: boolean, environment: string, description?: string, category?: string, reason?: string) => Promise<void>
  deleteRuntimeConfigItem: (key: string, environment: string, reason?: string) => Promise<void>
  clearConfigCache: () => Promise<void>
  setSelectedEnvironment: (environment: string) => void
  
  // Utility actions
  copyToClipboard: (text: string) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  dashboardStats: null,
  dashboardLoading: false,
  chartData: [],
  
  users: [],
  usersLoading: false,
  usersError: null,
  userFilters: {
    search: '',
    vipStatus: 'all',
    minCoins: 0
  },
  
  videos: [],
  videosLoading: false,
  videoFilters: {
    search: '',
    status: 'all',
    dateRange: [null, null]
  },
  
  analyticsData: null,
  analyticsLoading: false,
  
  bugReportData: null,
  bugReportsLoading: false,
  
  systemSettings: null,
  settingsLoading: false,
  
  runtimeConfig: [],
  configAuditLogs: [],
  clientConfig: null,
  selectedEnvironment: 'production',
  isLoading: false,

  // Dashboard actions
  fetchDashboardStats: async () => {
    set({ dashboardLoading: true })
    try {
      console.log('Fetching dashboard stats...')
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Get total users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, is_vip, coins, created_at')

      if (usersError) {
        console.error('Error fetching users for dashboard:', usersError)
        throw usersError
      }

      // Get active videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, status, coin_cost, created_at')

      if (videosError) {
        console.error('Error fetching videos for dashboard:', videosError)
        throw videosError
      }

      // Get transactions for revenue calculation
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, transaction_type, created_at')
        .eq('transaction_type', 'coin_purchase')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      if (transactionsError) {
        console.error('Error fetching transactions for dashboard:', transactionsError)
      }

      // Calculate stats
      const totalUsers = usersData?.length || 0
      const vipUsers = usersData?.filter(u => u.is_vip).length || 0
      const activeVideos = videosData?.filter(v => v.status === 'active').length || 0
      const monthlyRevenue = transactionsData?.reduce((sum, t) => sum + (t.amount * 0.01), 0) || 0
      const totalCoinsDistributed = usersData?.reduce((sum, u) => sum + (u.coins || 0), 0) || 0
      
      console.log('Dashboard stats calculated:', {
        totalUsers,
        vipUsers,
        activeVideos,
        monthlyRevenue,
        totalCoinsDistributed
      })

      const stats: DashboardStats = {
        total_users: totalUsers,
        active_videos: activeVideos,
        vip_users: vipUsers,
        monthly_revenue: monthlyRevenue,
        user_growth_rate: 12.5,
        daily_active_users: Math.floor(totalUsers * 0.3),
        coin_transactions: transactionsData?.length || 0,
        total_coins_distributed: totalCoinsDistributed,
        video_completion_rate: 85.2,
        average_watch_time: 45,
        total_transactions: transactionsData?.length || 0,
        pending_videos: videosData?.filter(v => v.status === 'pending').length || 0
      }

      set({ dashboardStats: stats })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Set empty stats on error
      set({ 
        dashboardStats: {
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
      })
    } finally {
      set({ dashboardLoading: false })
    }
  },

  // Users actions
  fetchUsers: async () => {
    set({ usersLoading: true, usersError: null })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error fetching users:', error)
        throw error
      }

      const users = data || []
      console.log('Users fetched from database:', users.length)
      set({ users })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      set({ 
        users: [],
        usersError: error instanceof Error ? error.message : 'Failed to fetch users'
      })
    } finally {
      set({ usersLoading: false })
    }
  },

  setUserFilters: (filters) => {
    set(state => ({
      userFilters: { ...state.userFilters, ...filters }
    }))
  },

  adjustUserCoins: async (userId: string, amount: number, reason: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase admin not initialized')
      }

      // Update user coins
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      const newBalance = (userData.coins || 0) + amount

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newBalance })
        .eq('id', userId)

      if (updateError) throw updateError

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_type: amount > 0 ? 'adjustment' : 'adjustment',
          amount: amount,
          description: reason,
          admin_id: 'admin-1'
        })

      if (transactionError) throw transactionError

      // Update local state
      set(state => ({
        users: state.users.map(user => 
          user.id === userId 
            ? { ...user, coins: newBalance }
            : user
        )
      }))
    } catch (error) {
      console.error('Failed to adjust user coins:', error)
      throw error
    }
  },

  toggleUserVip: async (userId: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase admin not initialized')
      }

      const user = get().users.find(u => u.id === userId)
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('profiles')
        .update({ is_vip: !user.is_vip })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      set(state => ({
        users: state.users.map(u => 
          u.id === userId 
            ? { ...u, is_vip: !u.is_vip }
            : u
        )
      }))
    } catch (error) {
      console.error('Failed to toggle VIP status:', error)
      throw error
    }
  },

  // Videos actions
  fetchVideos: async () => {
    set({ videosLoading: true })
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error fetching videos:', error)
        throw error
      }

      const videos = data || []
      console.log('Videos fetched from database:', videos.length)
      set({ videos })
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      set({ videos: [] })
    } finally {
      set({ videosLoading: false })
    }
  },

  setVideoFilters: (filters) => {
    set(state => ({
      videoFilters: { ...state.videoFilters, ...filters }
    }))
  },

  deleteVideo: async (videoId: string, reason: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase admin not initialized')
      }

      // Get video details before deletion
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single()

      if (videoError) throw videoError

      // Create deletion record
      const { error: deletionError } = await supabase
        .from('video_deletions')
        .insert({
          video_id: videoId,
          user_id: video.user_id,
          video_title: video.title,
          coin_cost: video.coin_cost || 0,
          refund_amount: video.coin_cost || 0,
          refund_percentage: 100,
          deleted_at: new Date().toISOString()
        })

      if (deletionError) throw deletionError

      // Delete the video
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (deleteError) throw deleteError

      // Update local state
      set(state => ({
        videos: state.videos.filter(v => v.id !== videoId)
      }))
    } catch (error) {
      console.error('Failed to delete video:', error)
      throw error
    }
  },

  // Analytics actions
  fetchAnalytics: async (dateRange: [Date | null, Date | null]) => {
    set({ analyticsLoading: true })
    try {
      console.log('Fetching analytics data...')
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const startDate = dateRange[0] || subDays(new Date(), 30)
      const endDate = dateRange[1] || new Date()
      
      console.log('Analytics date range:', { startDate, endDate })

      // Fetch users active in the date range
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('profiles')
        .select('id, updated_at')
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString())

      if (activeUsersError) {
        console.warn('Failed to fetch active users:', activeUsersError)
      } else {
        console.log('Active users data:', activeUsersData?.length || 0)
      }

      // Fetch transactions in the date range
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, created_at, amount, transaction_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (transactionsError) {
        console.warn('Failed to fetch transactions:', transactionsError)
      } else {
        console.log('Transactions data:', transactionsData?.length || 0)
      }

      // Fetch videos promoted in the date range
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (videosError) {
        console.warn('Failed to fetch videos:', videosError)
      } else {
        console.log('Videos data:', videosData?.length || 0)
      }

      // Fetch video deletions
      const { data: deletionsData, error: deletionsError } = await supabase
        .from('video_deletions')
        .select('id, deleted_at')
        .gte('deleted_at', startDate.toISOString())
        .lte('deleted_at', endDate.toISOString())

      if (deletionsError) {
        console.warn('Failed to fetch deletions:', deletionsError)
      } else {
        console.log('Deletions data:', deletionsData?.length || 0)
      }

      // Generate user growth data
      const userGrowthData = []
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)

        const activeOnDay = activeUsersData?.filter(user => {
          const lastActive = new Date(user.updated_at)
          return lastActive >= dayStart && lastActive <= dayEnd
        }).length || 0

        userGrowthData.push({
          date: format(date, 'MMM dd'),
          activeUsers: activeOnDay
        })
      }

      const analyticsData: AnalyticsData = {
        dailyActiveUsers: activeUsersData?.length || 0,
        coinTransactions: transactionsData?.length || 0,
        totalPromoted: videosData?.length || 0,
        videosDeleted: deletionsData?.length || 0,
        userGrowthData,
        coinTransactionData: [],
        topVideos: [],
        recentActivity: []
      }

      console.log('Analytics data compiled:', analyticsData)
      set({ analyticsData })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      set({ analyticsData: null })
    } finally {
      set({ analyticsLoading: false })
    }
  },

  // Bug Reports actions
  fetchBugReports: async () => {
    set({ bugReportsLoading: true })
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const bugReportData: BugReportData = {
        newBugs: data?.filter(b => b.status === 'new').length || 0,
        bugsFixedToday: data?.filter(b => 
          b.status === 'fixed' && 
          new Date(b.updated_at) > subDays(new Date(), 1)
        ).length || 0,
        totalBugs: data?.length || 0,
        bugReports: data || []
      }

      set({ bugReportData })
    } catch (error) {
      console.error('Failed to fetch bug reports:', error)
      set({ bugReportData: null })
    } finally {
      set({ bugReportsLoading: false })
    }
  },

  // System Settings actions
  fetchSystemSettings: async () => {
    set({ settingsLoading: true })
    try {
      // Mock system settings for now
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

      set({ systemSettings: settings })
    } catch (error) {
      console.error('Failed to fetch system settings:', error)
      set({ systemSettings: null })
    } finally {
      set({ settingsLoading: false })
    }
  },

  updateSystemSettings: async (settings: SystemSettings) => {
    try {
      // Mock update for now
      set({ systemSettings: settings })
    } catch (error) {
      console.error('Failed to update system settings:', error)
      throw error
    }
  },

  // Runtime Configuration actions
  fetchRuntimeConfig: async (environment: string) => {
    set({ isLoading: true })
    try {
      // Mock runtime config for now
      const configs: RuntimeConfig[] = [
        {
          id: '1',
          key: 'FEATURE_ADS_ENABLED',
          value: 'true',
          isPublic: true,
          environment,
          description: 'Enable advertisement features',
          category: 'features',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          key: 'ADMOB_APP_ID',
          value: 'ca-app-pub-2892152842024866~2841739969',
          isPublic: true,
          environment,
          description: 'AdMob application ID',
          category: 'admob',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      set({ runtimeConfig: configs })
    } catch (error) {
      console.error('Failed to fetch runtime config:', error)
      set({ runtimeConfig: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchConfigAuditLogs: async (configKey?: string, environment?: string) => {
    try {
      // Mock audit logs for now
      const logs: ConfigAuditLog[] = [
        {
          id: '1',
          configKey: configKey || 'FEATURE_ADS_ENABLED',
          environment: environment || 'production',
          action: 'update',
          oldValue: 'false',
          newValue: 'true',
          adminEmail: 'admin@vidgro.com',
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString(),
          reason: 'Enable ads for revenue'
        }
      ]

      set({ configAuditLogs: logs })
    } catch (error) {
      console.error('Failed to fetch config audit logs:', error)
      set({ configAuditLogs: [] })
    }
  },

  fetchClientConfig: async (environment: string) => {
    try {
      const response = await fetch(`/api/client-runtime-config?env=${environment}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.data) {
        throw new Error('No configuration data received')
      }

      const clientConfig: ClientRuntimeConfig = {
        config: result.data.config || {},
        categories: result.data.categories || {},
        environment: environment,
        timestamp: new Date().toISOString()
      }

      set({ clientConfig })
    } catch (error) {
      console.error('Failed to fetch client config:', error)
      set({ clientConfig: null })
    }
  },

  saveRuntimeConfig: async (key: string, value: string, isPublic: boolean, environment: string, description?: string, category?: string, reason?: string) => {
    try {
      // Mock save for now
      const newConfig: RuntimeConfig = {
        id: Date.now().toString(),
        key,
        value,
        isPublic,
        environment,
        description,
        category: category || 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      set(state => ({
        runtimeConfig: [newConfig, ...state.runtimeConfig.filter(c => c.key !== key)]
      }))
    } catch (error) {
      console.error('Failed to save runtime config:', error)
      throw error
    }
  },

  deleteRuntimeConfigItem: async (key: string, environment: string, reason?: string) => {
    try {
      // Mock delete for now
      set(state => ({
        runtimeConfig: state.runtimeConfig.filter(c => c.key !== key)
      }))
    } catch (error) {
      console.error('Failed to delete runtime config:', error)
      throw error
    }
  },

  clearConfigCache: async () => {
    try {
      await fetch('/api/admin/clear-config-cache', { method: 'POST' })
    } catch (error) {
      console.error('Failed to clear config cache:', error)
    }
  },

  setSelectedEnvironment: (environment: string) => {
    set({ selectedEnvironment: environment })
  },

  // Utility actions
  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      throw error
    }
  }
}))