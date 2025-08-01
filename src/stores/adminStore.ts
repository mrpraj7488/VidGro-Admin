import { create } from 'zustand'
import { DashboardStats, User, Video, UserFilters, VideoFilters, ChartDataPoint } from '../types/admin'
import { mockDashboardStats, mockUsers, mockVideos, mockChartData } from '../lib/supabase'

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
  
  // Actions
  fetchDashboardStats: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchVideos: () => Promise<void>
  updateUserCoins: (userId: string, coins: number) => Promise<void>
  updateVideoStatus: (videoId: string, status: string) => Promise<void>
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

  setUserFilters: (filters) => {
    set({ userFilters: { ...get().userFilters, ...filters } })
  },

  setVideoFilters: (filters) => {
    set({ videoFilters: { ...get().videoFilters, ...filters } })
  }
}))