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
  BugReport,
  SystemSettings,
  RuntimeConfig,
  ConfigAuditLog,
  ClientRuntimeConfig
} from '../types/admin'
import { 
  getDashboardStats,
  getUsers,
  getVideos,
  adjustUserCoins,
  toggleUserVip,
  updateVideoStatus as updateVideoStatusAPI,
  getUserGrowthAnalytics,
  getVideoPerformanceAnalytics,
  getCoinEconomyAnalytics,
  getSystemConfig,
  getAdminLogs,
  checkAdminPermission,
  getRuntimeConfig,
  upsertRuntimeConfig,
  deleteRuntimeConfig,
  getConfigAuditLogs,
  getClientRuntimeConfig,
  Profile,
  Video as VideoType
} from '../lib/supabase'
import { mockBugReportData, mockSystemSettings } from '../lib/supabase'
import { realtimeService, RealtimeEvent, createCoinAdjustmentNotification, createVideoStatusNotification } from '../services/realtimeService'
import { envManager, EnvironmentVariables } from '../lib/envManager'
import { logger } from '../lib/logger'

interface AdminStore {
  // Dashboard data
  dashboardStats: DashboardStats | null
  chartData: ChartDataPoint[]
  isLoading: boolean
  
  // User management
  users: Profile[]
  userFilters: UserFilters
  
  // Video management
  videos: VideoType[]
  videoFilters: VideoFilters
  selectedVideo: VideoType | null
  
  // Analytics data
  analyticsData: AnalyticsData | null
  
  // Bug reports
  bugReportData: BugReportData | null
  
  // System settings
  systemSettings: SystemSettings | null
  
  // Runtime configuration
  runtimeConfig: RuntimeConfig[]
  configAuditLogs: ConfigAuditLog[]
  clientConfig: ClientRuntimeConfig | null
  selectedEnvironment: string
  
  // Actions
  fetchDashboardStats: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchVideos: () => Promise<void>
  fetchAnalytics: (dateRange?: [Date | null, Date | null]) => Promise<void>
  fetchBugReports: () => Promise<void>
  fetchSystemSettings: () => Promise<void>
  fetchRuntimeConfig: (environment?: string) => Promise<void>
  fetchConfigAuditLogs: (configKey?: string, environment?: string) => Promise<void>
  fetchClientConfig: (environment?: string) => Promise<void>
  initializeRealtime: () => void
  disconnectRealtime: () => void
  
  // User actions
  updateUserCoins: (userId: string, coins: number) => Promise<void>
  adjustUserCoins: (userId: string, amount: number, reason: string) => Promise<void>
  toggleUserVip: (userId: string) => Promise<void>
  
  // Video actions
  updateVideoStatus: (videoId: string, status: string) => Promise<void>
  getVideoDetails: (videoId: string) => Promise<VideoType | null>
  processRefund: (videoId: string, amount: number, percent: number) => Promise<void>
  
  // Bug report actions
  createBugReport: (report: Partial<BugReport>) => Promise<void>
  updateBugStatus: (bugId: string, status: string) => Promise<void>
  assignBug: (bugId: string, assignedTo: string) => Promise<void>
  
  // Moderation actions
  moderationData: any
  fetchModerationData: () => Promise<void>
  moderateContent: (itemId: string, action: 'approve' | 'reject' | 'flag') => Promise<void>
  
  // Economy actions
  economyData: any
  fetchEconomyData: () => Promise<void>
  updateCoinSettings: (settings: any) => Promise<void>
  
  // System settings actions
  updateEnvironmentVars: (vars: Partial<EnvironmentVariables>) => Promise<void>
  updateSystemSettings: (settings: SystemSettings) => Promise<void>
  
  // Runtime config actions
  saveRuntimeConfig: (key: string, value: string, isPublic: boolean, environment?: string, description?: string, category?: string, reason?: string) => Promise<void>
  deleteRuntimeConfigItem: (key: string, environment?: string, reason?: string) => Promise<void>
  clearConfigCache: () => Promise<void>
  setSelectedEnvironment: (environment: string) => void
  rotateKeys: (keys: string[], reason: string, notifyClients?: boolean) => Promise<void>
  fetchSecurityEvents: () => Promise<void>
  importConfiguration: (configData: Record<string, string>, environment: string, overwrite?: boolean) => Promise<void>
  
  // Utility actions
  copyToClipboard: (text: string) => void
  setUserFilters: (filters: Partial<UserFilters>) => void
  setVideoFilters: (filters: Partial<VideoFilters>) => void
  setSelectedVideo: (video: VideoType | null) => void

  // Realtime actions
  initializeRealtime: () => void
  disconnectRealtime: () => void
  handleRealtimeEvent: (event: RealtimeEvent) => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  dashboardStats: null,
  chartData: [],
  isLoading: false,
  users: [],
  userFilters: {
    search: '',
    vipStatus: 'all',
    minCoins: 0
  },
  videos: [],
  videoFilters: {
    search: '',
    status: 'all',
    dateRange: [null, null]
  },
  selectedVideo: null,
  analyticsData: null,
  bugReportData: null,
  systemSettings: null,
  moderationData: null,
  economyData: null,
  runtimeConfig: [],
  configAuditLogs: [],
  clientConfig: null,
  selectedEnvironment: 'production',

  // Dashboard actions
  fetchDashboardStats: async () => {
    set({ isLoading: true })
    try {
      const stats = await getDashboardStats()
      const chartData = await getUserGrowthAnalytics(30)
      
      set({ 
        dashboardStats: stats,
        chartData: chartData.map(item => ({
          date: item.date,
          users: item.new_users || 0,
          videos: 0, // Will be populated by video analytics
          coins: 0   // Will be populated by coin analytics
        })),
        isLoading: false 
      })
    } catch (error) {
      logger.error('Failed to fetch dashboard stats', error, 'adminStore')
      set({ isLoading: false })
    }
  },

  // User actions
  fetchUsers: async () => {
    set({ isLoading: true })
    try {
      const filters = get().userFilters
      const users = await getUsers(
        50, 0, 
        filters.search || undefined,
        filters.vipStatus === 'vip',
        filters.minCoins || undefined
      )
      set({ users, isLoading: false })
    } catch (error) {
      logger.error('Failed to fetch users', error, 'adminStore')
      set({ isLoading: false })
    }
  },

  updateUserCoins: async (userId: string, coins: number) => {
    try {
      // Update local state immediately for better UX
      const users = get().users.map(user => 
        user.id === userId ? { ...user, coins } : user
      )
      set({ users })
      
      // TODO: Implement actual API call to update coins
      logger.info('Updated user coins', { userId, coins }, 'adminStore')
    } catch (error) {
      logger.error('Failed to update user coins', error, 'adminStore')
      // Revert local state on error
      get().fetchUsers()
    }
  },

  adjustUserCoins: async (userId: string, amount: number, reason: string) => {
    try {
      const adminId = 'admin-1' // Get from auth context in real implementation
      const result = await adjustUserCoins(userId, amount, reason, adminId)
      
      if (result.success) {
        // Update local state
        const users = get().users.map(user => 
          user.id === userId ? { ...user, coins: result.newBalance || user.coins + amount } : user
        )
        set({ users })
        
        // Send notification to user
        await realtimeService.sendUserNotification(
          userId, 
          createCoinAdjustmentNotification(amount, reason)
        )
        
        logger.info('Coins adjusted successfully', result, 'adminStore')
      }
    } catch (error) {
      logger.error('Failed to adjust user coins', error, 'adminStore')
      throw error
    }
  },

  toggleUserVip: async (userId: string) => {
    try {
      const users = get().users.map(user => 
        user.id === userId ? { ...user, is_vip: !user.is_vip } : user
      )
      set({ users })
      
      // TODO: Implement actual API call to toggle VIP status
      logger.info('Toggled VIP status for user', { userId }, 'adminStore')
    } catch (error) {
      logger.error('Failed to toggle VIP status', error, 'adminStore')
      // Revert local state on error
      get().fetchUsers()
    }
  },

  // Video actions
  fetchVideos: async () => {
    set({ isLoading: true })
    try {
      const filters = get().videoFilters
      const videos = await getVideos(
        50, 0,
        filters.status !== 'all' ? filters.status : undefined,
        filters.search || undefined
      )
      set({ videos, isLoading: false })
    } catch (error) {
      logger.error('Failed to fetch videos', error, 'adminStore')
      set({ isLoading: false })
    }
  },

  updateVideoStatus: async (videoId: string, status: string) => {
    try {
      const adminId = 'admin-1' // Get from auth context in real implementation
      const result = await updateVideoStatusAPI(videoId, status, adminId)
      
      if (result.success) {
        // Update local state
        const videos = get().videos.map(video => 
          video.id === videoId ? { ...video, status: status as any } : video
        )
        set({ videos })
        
        // Find the video to get user info
        const video = get().videos.find(v => v.id === videoId)
        if (video) {
          // Send notification to video owner
          await realtimeService.sendUserNotification(
            video.user_id,
            createVideoStatusNotification(video.title, status)
          )
        }
        
        logger.info('Video status updated successfully', result, 'adminStore')
      }
    } catch (error) {
      logger.error('Failed to update video status', error, 'adminStore')
      throw error
    }
  },

  getVideoDetails: async (videoId: string) => {
    const video = get().videos.find(v => v.id === videoId)
    return video || null
  },

  processRefund: async (videoId: string, amount: number, percent: number) => {
    try {
      const videos = get().videos.map(video => 
        video.id === videoId ? { 
          ...video, 
          refund_amount: amount, 
          refund_percent: percent,
          status: 'rejected' as any
        } : video
      )
      set({ videos })
      
      // TODO: Implement actual API call for refund processing
      logger.info('Processed refund', { videoId, amount, percent }, 'adminStore')
    } catch (error) {
      logger.error('Failed to process refund', error, 'adminStore')
      throw error
    }
  },

  // Analytics actions
  fetchAnalytics: async (dateRange) => {
    set({ isLoading: true })
    try {
      const daysBack = dateRange && dateRange[0] && dateRange[1] 
        ? Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24))
        : 30
      
      const [userGrowth, videoPerformance, coinEconomy] = await Promise.all([
        getUserGrowthAnalytics(daysBack),
        getVideoPerformanceAnalytics(daysBack),
        getCoinEconomyAnalytics(daysBack)
      ])
      
      const analyticsData = {
        dailyActiveUsers: userGrowth.reduce((sum, day) => sum + (day.active_users || 0), 0),
        coinTransactions: coinEconomy.reduce((sum, day) => sum + (day.coins_spent || 0), 0),
        totalPromoted: videoPerformance.reduce((sum, day) => sum + (day.videos_created || 0), 0),
        videosDeleted: 156, // This would come from video_deletions table
        userGrowthData: userGrowth.map(item => ({
          date: item.date,
          activeUsers: item.active_users || 0
        })),
        coinTransactionData: coinEconomy.map(item => ({
          date: item.date,
          transactions: item.coins_spent || 0,
          volume: item.coins_earned || 0
        })),
        topVideos: [], // Would need separate query for top videos
        recentActivity: [] // Would need separate query for recent activity
      }
      
      set({ analyticsData, isLoading: false })
    } catch (error) {
      logger.error('Failed to fetch analytics', error, 'adminStore')
      set({ isLoading: false })
    }
  },

  // Moderation actions
  moderationData: null,
  fetchModerationData: async () => {
    set({ isLoading: true })
    set({ 
      moderationData: {
        pendingCount: 15,
        approvedToday: 42,
        flaggedCount: 8,
        pendingItems: [],
        stats: {
          totalReviewed: 1250,
          approvalRate: 85,
          avgResponseTime: 2.5,
          activeReports: 23
        }
      }, 
      isLoading: false 
    })
  },

  moderateContent: async (itemId: string, action: 'approve' | 'reject' | 'flag') => {
    // Mock implementation
  },

  // Economy actions
  economyData: null,
  fetchEconomyData: async () => {
    set({ isLoading: true })
    set({ 
      economyData: {
        totalCoinsCirculation: 2500000,
        monthlyRevenue: 89500,
        coinVelocity: 1.8,
        activeSpenders: 3247,
        settings: {
          coinPrice: 0.01,
          videoReward: 10,
          referralBonus: 50,
          vipMultiplier: 2.0
        },
        coinFlowData: [],
        revenueData: [],
        healthIndicators: [],
        topSpenders: [],
        alerts: []
      }, 
      isLoading: false 
    })
  },

  updateCoinSettings: async (settings: any) => {
    const currentData = get().economyData
    if (currentData) {
      set({
        economyData: {
          ...currentData,
          settings
        }
      })
    }
  },

  // Bug report actions
  fetchBugReports: async () => {
    set({ isLoading: true })
    set({ bugReportData: mockBugReportData, isLoading: false })
  },

  createBugReport: async (report: Partial<BugReport>) => {
    const newReport: BugReport = {
      bug_id: `bug-${Date.now()}`,
      title: report.title || '',
      description: report.description || '',
      status: 'new',
      priority: report.priority || 'medium',
      reported_by: report.reported_by || 'admin',
      category: report.category || 'general',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const currentData = get().bugReportData
    if (currentData) {
      set({
        bugReportData: {
          ...currentData,
          bugReports: [newReport, ...currentData.bugReports],
          newBugs: currentData.newBugs + 1,
          totalBugs: currentData.totalBugs + 1
        }
      })
    }
  },

  updateBugStatus: async (bugId: string, status: string) => {
    const currentData = get().bugReportData
    if (currentData) {
      const updatedReports = currentData.bugReports.map(bug =>
        bug.bug_id === bugId ? { 
          ...bug, 
          status: status as any, 
          updated_at: new Date().toISOString() 
        } : bug
      )
      
      const bugsFixedToday = status === 'fixed' ? currentData.bugsFixedToday + 1 : currentData.bugsFixedToday
      
      set({
        bugReportData: {
          ...currentData,
          bugReports: updatedReports,
          bugsFixedToday
        }
      })
    }
  },

  assignBug: async (bugId: string, assignedTo: string) => {
    const currentData = get().bugReportData
    if (currentData) {
      const updatedReports = currentData.bugReports.map(bug =>
        bug.bug_id === bugId ? { 
          ...bug, 
          assigned_to: assignedTo,
          status: 'in_progress' as any,
          updated_at: new Date().toISOString() 
        } : bug
      )
      
      set({
        bugReportData: {
          ...currentData,
          bugReports: updatedReports
        }
      })
    }
  },

  // System settings actions
  fetchSystemSettings: async () => {
    set({ isLoading: true })
    try {
      const settings = await getSystemConfig()
      set({ systemSettings: settings, isLoading: false })
    } catch (error) {
      logger.error('Failed to fetch system settings', error, 'adminStore')
      set({ isLoading: false })
    }
  },

  updateEnvironmentVars: async (vars: Partial<SystemEnvironment>) => {
    try {
      const result = await envManager.saveEnvironmentVariables(vars)
      if (result.success) {
        const currentSettings = get().systemSettings
        if (currentSettings) {
          set({
            systemSettings: {
              ...currentSettings,
              environment: { ...currentSettings.environment, ...vars }
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to update environment variables:', error)
      throw error
    }
  },

  // Runtime config actions
  fetchRuntimeConfig: async (environment = 'production') => {
    set({ isLoading: true })
    try {
      const config = await getRuntimeConfig(environment)
      set({ runtimeConfig: config, isLoading: false })
    } catch (error) {
      logger.error('Failed to fetch runtime config', error, 'adminStore')
      set({ isLoading: false })
    }
  },

  fetchConfigAuditLogs: async (configKey, environment) => {
    try {
      const logs = await getConfigAuditLogs(configKey, environment)
      set({ configAuditLogs: logs })
    } catch (error) {
      logger.error('Failed to fetch config audit logs', error, 'adminStore')
    }
  },

  fetchClientConfig: async (environment = 'production') => {
    try {
      const config = await getClientRuntimeConfig(environment)
      set({ clientConfig: config })
    } catch (error) {
      logger.error('Failed to fetch client config', error, 'adminStore')
    }
  },

  saveRuntimeConfig: async (key, value, isPublic, environment = 'production', description, category = 'general', reason) => {
    try {
      const result = await upsertRuntimeConfig(key, value, isPublic, environment, description, category, reason)
      if (result.success) {
        // Refresh runtime config
        await get().fetchRuntimeConfig(environment)
        // Refresh audit logs
        await get().fetchConfigAuditLogs()
        logger.info('Runtime config saved successfully', result, 'adminStore')
      }
    } catch (error) {
      logger.error('Failed to save runtime config', error, 'adminStore')
      throw error
    }
  },

  deleteRuntimeConfigItem: async (key, environment = 'production', reason) => {
    try {
      const result = await deleteRuntimeConfig(key, environment, reason)
      if (result.success) {
        // Refresh runtime config
        await get().fetchRuntimeConfig(environment)
        // Refresh audit logs
        await get().fetchConfigAuditLogs()
        logger.info('Runtime config deleted successfully', result, 'adminStore')
      }
    } catch (error) {
      logger.error('Failed to delete runtime config', error, 'adminStore')
      throw error
    }
  },

  clearConfigCache: async () => {
    try {
      const response = await fetch('/api/admin/clear-config-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'admin@vidgro.com'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to clear cache')
      }
      
      logger.info('Config cache cleared', null, 'adminStore')
    } catch (error) {
      logger.error('Failed to clear config cache', error, 'adminStore')
      throw error
    }
  },

  setSelectedEnvironment: (environment) => {
    set({ selectedEnvironment: environment })
  },

  rotateKeys: async (keys, reason, notifyClients = false) => {
    try {
      const response = await fetch('/api/admin/rotate-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'admin@vidgro.com'
        },
        body: JSON.stringify({ keys, reason, notifyClients })
      })
      
      if (!response.ok) {
        throw new Error('Failed to rotate keys')
      }
      
      const result = await response.json()
      
      // Refresh runtime config to show updated keys
      await get().fetchRuntimeConfig(get().selectedEnvironment)
      
      logger.info('Keys rotated successfully', result, 'adminStore')
    } catch (error) {
      logger.error('Failed to rotate keys', error, 'adminStore')
      throw error
    }
  },

  fetchSecurityEvents: async () => {
    try {
      const response = await fetch('/api/admin/security-events', {
        headers: {
          'x-admin-email': 'admin@vidgro.com'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch security events')
      }
      
      const result = await response.json()
      logger.info('Security events fetched', result.metadata, 'adminStore')
      return result.data
    } catch (error) {
      logger.error('Failed to fetch security events', error, 'adminStore')
      return []
    }
  },

  importConfiguration: async (configData, environment, overwrite = false) => {
    try {
      const results = []
      
      for (const [key, value] of Object.entries(configData)) {
        if (typeof value === 'string') {
          try {
            await get().saveRuntimeConfig(
              key,
              value,
              false, // Default to private for imported configs
              environment,
              'Imported configuration',
              'general',
              'Bulk import from JSON'
            )
            results.push({ key, success: true })
          } catch (error) {
            results.push({ key, success: false, error: error.message })
          }
        }
      }
      
      logger.info('Configuration import completed', { 
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }, 'adminStore')
      
      return results
    } catch (error) {
      logger.error('Failed to import configuration', error, 'adminStore')
      throw error
    }
  },
  updateSystemSettings: async (newSettings) => {
    set({ systemSettings: newSettings })
  },
  // Utility actions
  copyToClipboard: (text: string) => {
    navigator.clipboard.writeText(text)
  },

  setUserFilters: (filters) => {
    set({ userFilters: { ...get().userFilters, ...filters } })
  },

  setVideoFilters: (filters) => {
    set({ videoFilters: { ...get().videoFilters, ...filters } })
  },

  setSelectedVideo: (video) => {
    set({ selectedVideo: video })
  },

  // Realtime actions
  initializeRealtime: () => {
    realtimeService.initialize()
    
    // Subscribe to user updates
    realtimeService.subscribeToUserUpdates((event) => {
      get().handleRealtimeEvent(event)
    })
    
    // Subscribe to video updates
    realtimeService.subscribeToVideoUpdates((event) => {
      get().handleRealtimeEvent(event)
    })
  },

  disconnectRealtime: () => {
    realtimeService.disconnect()
  },

  handleRealtimeEvent: (event: RealtimeEvent) => {
    switch (event.type) {
      case 'user_update':
        // Refresh users data
        get().fetchUsers()
        break
      case 'video_update':
        // Refresh videos data
        get().fetchVideos()
        break
      default:
        logger.debug('Unhandled realtime event', event, 'adminStore')
    }
  }
}))