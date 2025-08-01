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
  SystemEnvironment,
  AdsConfiguration
} from '../types/admin'
import { 
  mockDashboardStats, 
  mockUsers, 
  mockVideos, 
  mockChartData,
  mockAnalyticsData,
  mockBugReportData,
  mockSystemSettings
} from '../lib/supabase'

interface AdminStore {
  // Dashboard data
  dashboardStats: DashboardStats | null
  chartData: ChartDataPoint[]
  isLoading: boolean
  
  // User management
  users: User[]
  userFilters: UserFilters
  
  // Video management
  videos: Video[]
  videoFilters: VideoFilters
  selectedVideo: Video | null
  
  // Analytics data
  analyticsData: AnalyticsData | null
  
  // Bug reports
  bugReportData: BugReportData | null
  
  // System settings
  systemSettings: SystemSettings | null
  
  // Actions
  fetchDashboardStats: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchVideos: () => Promise<void>
  fetchAnalytics: (dateRange?: [Date | null, Date | null]) => Promise<void>
  fetchBugReports: () => Promise<void>
  fetchSystemSettings: () => Promise<void>
  
  // User actions
  updateUserCoins: (userId: string, coins: number) => Promise<void>
  toggleUserVip: (userId: string) => Promise<void>
  
  // Video actions
  updateVideoStatus: (videoId: string, status: string) => Promise<void>
  getVideoDetails: (videoId: string) => Promise<Video | null>
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
  updateEnvironmentVars: (vars: Partial<SystemEnvironment>) => Promise<void>
  updateAdsConfig: (config: Partial<AdsConfiguration>) => Promise<void>
  updateSystemSettings: (settings: SystemSettings) => Promise<void>
  
  // Utility actions
  copyToClipboard: (text: string) => void
  setUserFilters: (filters: Partial<UserFilters>) => void
  setVideoFilters: (filters: Partial<VideoFilters>) => void
  setSelectedVideo: (video: Video | null) => void
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

  // Dashboard actions
  fetchDashboardStats: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 500))
    set({ 
      dashboardStats: mockDashboardStats,
      chartData: mockChartData,
      isLoading: false 
    })
  },

  // User actions
  fetchUsers: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ users: mockUsers, isLoading: false })
  },

  updateUserCoins: async (userId: string, coins: number) => {
    const users = get().users.map(user => 
      user.user_id === userId ? { ...user, coins } : user
    )
    set({ users })
  },

  toggleUserVip: async (userId: string) => {
    const users = get().users.map(user => 
      user.user_id === userId ? { ...user, is_vip: !user.is_vip } : user
    )
    set({ users })
  },

  // Video actions
  fetchVideos: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ videos: mockVideos, isLoading: false })
  },

  updateVideoStatus: async (videoId: string, status: string) => {
    const videos = get().videos.map(video => 
      video.video_id === videoId ? { ...video, status: status as any } : video
    )
    set({ videos })
  },

  getVideoDetails: async (videoId: string) => {
    const video = get().videos.find(v => v.video_id === videoId)
    return video || null
  },

  processRefund: async (videoId: string, amount: number, percent: number) => {
    const videos = get().videos.map(video => 
      video.video_id === videoId ? { 
        ...video, 
        refund_amount: amount, 
        refund_percent: percent,
        status: 'deleted' as any
      } : video
    )
    set({ videos })
  },

  // Analytics actions
  fetchAnalytics: async (dateRange) => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 500))
    set({ analyticsData: mockAnalyticsData, isLoading: false })
  },

  // Moderation actions
  moderationData: null,
  fetchModerationData: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 500))
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
    await new Promise(resolve => setTimeout(resolve, 300))
  },

  // Economy actions
  economyData: null,
  fetchEconomyData: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 500))
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
    await new Promise(resolve => setTimeout(resolve, 300))
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
    await new Promise(resolve => setTimeout(resolve, 400))
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
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ systemSettings: mockSystemSettings, isLoading: false })
  },

  updateEnvironmentVars: async (vars: Partial<SystemEnvironment>) => {
    const currentSettings = get().systemSettings
    if (currentSettings) {
      set({
        systemSettings: {
          ...currentSettings,
          environment: { ...currentSettings.environment, ...vars }
        }
      })
    }
  },

  updateAdsConfig: async (config: Partial<AdsConfiguration>) => {
    const currentSettings = get().systemSettings
    if (currentSettings) {
      set({
        systemSettings: {
          ...currentSettings,
          ads: { ...currentSettings.ads, ...config }
        }
      })
    }
  },

  updateSystemSettings: async (newSettings) => {
    await new Promise(resolve => setTimeout(resolve, 500))
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
  }
}))