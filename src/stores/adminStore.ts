import { create } from 'zustand'
import { 
  DashboardStats, 
  User, 
  Video, 
  UserFilters, 
  VideoFilters, 
  ChartDataPoint,
  AnalyticsData,
  EconomyData,
  ModerationData,
  SystemSettings
} from '../types/admin'
import { 
  mockDashboardStats, 
  mockUsers, 
  mockVideos, 
  mockChartData,
  mockAnalyticsData,
  mockEconomyData,
  mockModerationData,
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
  
  // Analytics data
  analyticsData: AnalyticsData | null
  
  // Economy data
  economyData: EconomyData | null
  
  // Moderation data
  moderationData: ModerationData | null
  
  // System settings
  systemSettings: SystemSettings | null
  
  // Actions
  fetchDashboardStats: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchVideos: () => Promise<void>
  fetchAnalytics: (dateRange?: [Date | null, Date | null]) => Promise<void>
  fetchEconomyData: () => Promise<void>
  fetchModerationData: () => Promise<void>
  fetchSystemSettings: () => Promise<void>
  updateUserCoins: (userId: string, coins: number) => Promise<void>
  updateVideoStatus: (videoId: string, status: string) => Promise<void>
  updateCoinSettings: (settings: any) => Promise<void>
  moderateContent: (itemId: string, action: string) => Promise<void>
  updateSystemSettings: (settings: SystemSettings) => Promise<void>
  setUserFilters: (filters: Partial<UserFilters>) => void
  setVideoFilters: (filters: Partial<VideoFilters>) => void
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
  analyticsData: null,
  economyData: null,
  moderationData: null,
  systemSettings: null,

  // Actions
  fetchDashboardStats: async () => {
    set({ isLoading: true })
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    set({ 
      dashboardStats: mockDashboardStats,
      chartData: mockChartData,
      isLoading: false 
    })
  },

  fetchUsers: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ users: mockUsers, isLoading: false })
  },

  fetchVideos: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ videos: mockVideos, isLoading: false })
  },

  fetchAnalytics: async (dateRange) => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 500))
    set({ analyticsData: mockAnalyticsData, isLoading: false })
  },

  fetchEconomyData: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 400))
    set({ economyData: mockEconomyData, isLoading: false })
  },

  fetchModerationData: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 400))
    set({ moderationData: mockModerationData, isLoading: false })
  },

  fetchSystemSettings: async () => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ systemSettings: mockSystemSettings, isLoading: false })
  },

  updateUserCoins: async (userId: string, coins: number) => {
    const users = get().users.map(user => 
      user.user_id === userId ? { ...user, coins } : user
    )
    set({ users })
  },

  updateVideoStatus: async (videoId: string, status: string) => {
    const videos = get().videos.map(video => 
      video.video_id === videoId ? { ...video, status: status as any } : video
    )
    set({ videos })
  },

  updateCoinSettings: async (newSettings) => {
    const economyData = get().economyData
    if (economyData) {
      set({ 
        economyData: { 
          ...economyData, 
          settings: newSettings 
        } 
      })
    }
  },

  moderateContent: async (itemId: string, action: string) => {
    const moderationData = get().moderationData
    if (moderationData) {
      const updatedItems = moderationData.pendingItems.map(item =>
        item.id === itemId ? { ...item, status: action } : item
      )
      set({
        moderationData: {
          ...moderationData,
          pendingItems: updatedItems,
          pendingCount: updatedItems.filter(item => item.status === 'pending').length
        }
      })
    }
  },

  updateSystemSettings: async (newSettings) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    set({ systemSettings: newSettings })
  },

  setUserFilters: (filters) => {
    set({ userFilters: { ...get().userFilters, ...filters } })
  },

  setVideoFilters: (filters) => {
    set({ videoFilters: { ...get().videoFilters, ...filters } })
  }
}))