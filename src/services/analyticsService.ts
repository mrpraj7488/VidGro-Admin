// Analytics Service for VidGro Admin Panel
// Handles tracking and reporting of platform metrics

export interface AnalyticsEvent {
  eventType: string
  userId?: string
  videoId?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface UserEngagementMetrics {
  avgSessionDuration: number
  completionRate: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  retentionRate: number
}

export interface VideoAnalytics {
  videoId: string
  title: string
  views: number
  completionRate: number
  avgWatchTime: number
  coinsEarned: number
  engagement: number
  demographics: {
    ageGroups: Record<string, number>
    countries: Record<string, number>
  }
}

export interface PlatformMetrics {
  totalUsers: number
  activeUsers: number
  totalVideos: number
  totalCoinsDistributed: number
  revenueGenerated: number
  conversionRate: number
}

export class AnalyticsService {
  private static instance: AnalyticsService

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  // Track user actions
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // In a real implementation, this would send to analytics service
      console.log('📊 Analytics Event:', event)
      
      // Store in local storage for demo purposes
      const events = this.getStoredEvents()
      events.push(event)
      localStorage.setItem('vidgro_analytics_events', JSON.stringify(events.slice(-1000))) // Keep last 1000 events
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }

  // Get user engagement metrics
  async getUserEngagementMetrics(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<UserEngagementMetrics> {
    try {
      // Mock implementation - in real app, this would query database
      const baseMetrics = {
        avgSessionDuration: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
        completionRate: Math.random() * 0.4 + 0.6, // 60-100%
        dailyActiveUsers: Math.floor(Math.random() * 5000) + 2000,
        weeklyActiveUsers: Math.floor(Math.random() * 15000) + 8000,
        monthlyActiveUsers: Math.floor(Math.random() * 50000) + 25000,
        retentionRate: Math.random() * 0.3 + 0.4 // 40-70%
      }

      // Adjust based on timeframe
      const multipliers = {
        '24h': 0.8,
        '7d': 1.0,
        '30d': 1.2
      }

      const multiplier = multipliers[timeframe]
      return {
        ...baseMetrics,
        dailyActiveUsers: Math.floor(baseMetrics.dailyActiveUsers * multiplier),
        weeklyActiveUsers: Math.floor(baseMetrics.weeklyActiveUsers * multiplier),
        monthlyActiveUsers: Math.floor(baseMetrics.monthlyActiveUsers * multiplier)
      }
    } catch (error) {
      console.error('Failed to get user engagement metrics:', error)
      throw error
    }
  }

  // Get video analytics
  async getVideoAnalytics(videoId: string, timeframe: '24h' | '7d' | '30d' = '7d'): Promise<VideoAnalytics> {
    try {
      // Mock implementation
      return {
        videoId,
        title: `Video ${videoId.slice(0, 8)}`,
        views: Math.floor(Math.random() * 100000) + 10000,
        completionRate: Math.random() * 0.4 + 0.6,
        avgWatchTime: Math.floor(Math.random() * 300) + 60,
        coinsEarned: Math.floor(Math.random() * 5000) + 1000,
        engagement: Math.random() * 0.3 + 0.1,
        demographics: {
          ageGroups: {
            '18-24': Math.floor(Math.random() * 30) + 20,
            '25-34': Math.floor(Math.random() * 35) + 25,
            '35-44': Math.floor(Math.random() * 25) + 15,
            '45+': Math.floor(Math.random() * 20) + 10
          },
          countries: {
            'US': Math.floor(Math.random() * 40) + 30,
            'UK': Math.floor(Math.random() * 20) + 15,
            'CA': Math.floor(Math.random() * 15) + 10,
            'AU': Math.floor(Math.random() * 10) + 5,
            'Other': Math.floor(Math.random() * 25) + 15
          }
        }
      }
    } catch (error) {
      console.error('Failed to get video analytics:', error)
      throw error
    }
  }

  // Get platform-wide metrics
  async getPlatformMetrics(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<PlatformMetrics> {
    try {
      const baseMetrics = {
        totalUsers: Math.floor(Math.random() * 100000) + 50000,
        activeUsers: Math.floor(Math.random() * 20000) + 10000,
        totalVideos: Math.floor(Math.random() * 50000) + 25000,
        totalCoinsDistributed: Math.floor(Math.random() * 10000000) + 5000000,
        revenueGenerated: Math.floor(Math.random() * 100000) + 50000,
        conversionRate: Math.random() * 0.1 + 0.05 // 5-15%
      }

      return baseMetrics
    } catch (error) {
      console.error('Failed to get platform metrics:', error)
      throw error
    }
  }

  // Get real-time analytics
  async getRealtimeAnalytics(): Promise<{
    onlineUsers: number
    videosWatchedLastHour: number
    coinsEarnedLastHour: number
    newUsersToday: number
    activePromotions: number
    lastTransaction?: {
      type: string
      amount: number
      timestamp: string
    }
  }> {
    try {
      return {
        onlineUsers: Math.floor(Math.random() * 1000) + 500,
        videosWatchedLastHour: Math.floor(Math.random() * 500) + 200,
        coinsEarnedLastHour: Math.floor(Math.random() * 10000) + 2000,
        newUsersToday: Math.floor(Math.random() * 100) + 50,
        activePromotions: Math.floor(Math.random() * 50) + 20,
        lastTransaction: {
          type: ['earned', 'spent', 'bonus'][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 1000) + 10,
          timestamp: new Date(Date.now() - Math.random() * 60000).toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to get realtime analytics:', error)
      throw error
    }
  }

  // Generate analytics report
  async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: PlatformMetrics
    userEngagement: UserEngagementMetrics
    topVideos: VideoAnalytics[]
    trends: Array<{
      date: string
      users: number
      videos: number
      coins: number
      revenue: number
    }>
  }> {
    try {
      const [summary, userEngagement] = await Promise.all([
        this.getPlatformMetrics('30d'),
        this.getUserEngagementMetrics('30d')
      ])

      // Generate mock trend data
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const trends = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        return {
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 1000) + 500,
          videos: Math.floor(Math.random() * 200) + 100,
          coins: Math.floor(Math.random() * 50000) + 10000,
          revenue: Math.floor(Math.random() * 5000) + 1000
        }
      })

      // Generate top videos
      const topVideos = await Promise.all(
        Array.from({ length: 10 }, (_, i) => 
          this.getVideoAnalytics(`top-video-${i + 1}`)
        )
      )

      return {
        summary,
        userEngagement,
        topVideos: topVideos.sort((a, b) => b.views - a.views),
        trends
      }
    } catch (error) {
      console.error('Failed to generate analytics report:', error)
      throw error
    }
  }

  // Export analytics data
  async exportData(
    format: 'csv' | 'json' | 'xlsx',
    dateRange: { start: Date; end: Date },
    includePersonalData: boolean = false
  ): Promise<Blob> {
    try {
      const report = await this.generateReport('monthly', dateRange.start, dateRange.end)
      
      let content: string
      let mimeType: string

      switch (format) {
        case 'csv':
          content = this.convertToCSV(report)
          mimeType = 'text/csv'
          break
        case 'json':
          content = JSON.stringify(report, null, 2)
          mimeType = 'application/json'
          break
        case 'xlsx':
          // In a real implementation, this would use a library like xlsx
          content = JSON.stringify(report, null, 2)
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          break
        default:
          throw new Error(`Unsupported format: ${format}`)
      }

      return new Blob([content], { type: mimeType })
    } catch (error) {
      console.error('Failed to export analytics data:', error)
      throw error
    }
  }

  // Helper methods
  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('vidgro_analytics_events')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - in real app, use proper CSV library
    const headers = Object.keys(data.summary).join(',')
    const values = Object.values(data.summary).join(',')
    return `${headers}\n${values}`
  }

  // Track specific admin actions
  async trackAdminAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'admin_action',
      userId: adminId,
      metadata: {
        action,
        targetType,
        targetId,
        ...metadata
      },
      timestamp: new Date().toISOString()
    })
  }

  // Track user interactions
  async trackUserInteraction(
    userId: string,
    interactionType: 'video_watch' | 'coin_earn' | 'coin_spend' | 'profile_update',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'user_interaction',
      userId,
      metadata: {
        interactionType,
        ...metadata
      },
      timestamp: new Date().toISOString()
    })
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance()