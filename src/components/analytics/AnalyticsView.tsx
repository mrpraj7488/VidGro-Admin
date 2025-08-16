import React, { useEffect, useState } from 'react'
import { Calendar, Download, TrendingUp, Users, Coins, BarChart3, Video, ArrowRight } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { DateRangePicker } from '../ui/DateRangePicker'
import { StatsCard } from '../dashboard/StatsCard'
import { getSupabaseClient } from '../../lib/supabase'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

// Helper function to get admin client
function getSupabaseAdminClient() {
  const { getSupabaseAdminClient } = require('../../lib/supabase')
  return getSupabaseAdminClient()
}

interface AnalyticsData {
  dailyActiveUsers: number
  coinTransactions: number
  totalPromoted: number
  videosDeleted: number
  userGrowthData: Array<{
    date: string
    activeUsers: number
  }>
  videoPromotionData: Array<{
    date: string
    promotions: number
    completions: number
  }>
  coinTransactionData: Array<{
    date: string
    transactions: number
    volume: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    value: string
  }>
}

export function AnalyticsView() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 30),
    new Date()
  ])

  useEffect(() => {
    fetchRealAnalytics()
  }, [dateRange])

  const fetchRealAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const startDate = dateRange[0] || subDays(new Date(), 30)
      const endDate = dateRange[1] || new Date()
      
      console.log('Fetching analytics data for date range:', { startDate, endDate })

      // Use the new analytics functions
      const { data: dashboardStats, error: statsError } = await supabase
        .rpc('get_dashboard_stats')
      
      if (statsError) {
        console.error('Failed to fetch dashboard stats:', statsError)
        throw statsError
      }
      
      console.log('Dashboard stats:', dashboardStats)
      
      // Get user growth data
      const { data: userGrowthData, error: userGrowthError } = await supabase
        .rpc('get_user_growth_analytics', { days_back: 30 })
      
      if (userGrowthError) {
        console.error('Failed to fetch user growth data:', userGrowthError)
      }
      
      console.log('User growth data:', userGrowthData)
      
      // Get video analytics data
      const { data: videoAnalyticsData, error: videoAnalyticsError } = await supabase
        .rpc('get_video_analytics', { days_back: 30 })
      
      if (videoAnalyticsError) {
        console.error('Failed to fetch video analytics:', videoAnalyticsError)
      }
      
      console.log('Video analytics data:', videoAnalyticsData)
      
      // Get coin transaction analytics
      const { data: coinAnalyticsData, error: coinAnalyticsError } = await supabase
        .rpc('get_coin_transaction_analytics', { days_back: 30 })
      
      if (coinAnalyticsError) {
        console.error('Failed to fetch coin analytics:', coinAnalyticsError)
      }
      
      console.log('Coin analytics data:', coinAnalyticsData)

      // Fetch recent activity from admin logs
      const { data: adminLogs, error: logsError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (logsError) console.warn('Failed to fetch admin logs:', logsError)
      
      console.log('Admin logs:', adminLogs)

      const recentActivity = adminLogs?.map(log => ({
        type: log.action || 'system',
        description: log.details?.description || log.action || 'System activity',
        timestamp: format(new Date(log.created_at), 'MMM dd, HH:mm'),
        value: log.details?.value || ''
      })) || []

      // Transform the data from the new functions
      const stats = dashboardStats?.[0] || {}
      
      // Transform user growth data
      const transformedUserGrowthData = userGrowthData?.map(row => ({
        date: row.date_label,
        activeUsers: Number(row.active_users) || 0
      })) || []
      
      // Transform video promotion data
      const videoPromotionData = videoAnalyticsData?.map(row => ({
        date: row.date_label,
        promotions: Number(row.videos_created) || 0,
        completions: Number(row.videos_completed) || 0
      })) || []
      
      // Transform coin transaction data
      const transformedCoinTransactionData = coinAnalyticsData?.map(row => ({
        date: row.date_label,
        transactions: Number(row.transaction_count) || 0,
        volume: Number(row.total_volume) || 0
      })) || []

      setAnalyticsData({
        dailyActiveUsers: Number(stats.daily_active_users) || 0,
        coinTransactions: Number(stats.coin_transactions) || 0,
        totalPromoted: Number(stats.active_videos) || 0,
        videosDeleted: 0, // Will be calculated from video_deletions table
        userGrowthData: transformedUserGrowthData,
        videoPromotionData,
        coinTransactionData: transformedCoinTransactionData,
        recentActivity
      })
      
      console.log('Analytics data set successfully:', {
        dailyActiveUsers: Number(stats.daily_active_users) || 0,
        coinTransactions: Number(stats.coin_transactions) || 0,
        totalPromoted: Number(stats.active_videos) || 0,
        userGrowthDataLength: transformedUserGrowthData.length,
        videoPromotionDataLength: videoPromotionData.length,
        coinTransactionDataLength: transformedCoinTransactionData.length
      })

    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Set empty data on error
      setAnalyticsData({
        dailyActiveUsers: 0,
        coinTransactions: 0,
        totalPromoted: 0,
        videosDeleted: 0,
        userGrowthData: [],
        videoPromotionData: [],
        coinTransactionData: [],
        recentActivity: []
      })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleNavigateToCoinTransactions = () => {
    // Navigate to coin transactions screen
    window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'coin-transactions' }))
  }

  if (analyticsLoading || !analyticsData) {
    return (
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 md:h-32 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="h-64 md:h-80 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          <div className="h-64 md:h-80 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  // Check if we have meaningful data to display
  const hasUserGrowthData = analyticsData.userGrowthData && analyticsData.userGrowthData.length > 0
  const hasVideoPromotionData = analyticsData.videoPromotionData && analyticsData.videoPromotionData.length > 0
  const hasCoinTransactionData = analyticsData.coinTransactionData && analyticsData.coinTransactionData.length > 0
  const hasRecentActivity = analyticsData.recentActivity && analyticsData.recentActivity.length > 0

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Analytics Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Comprehensive insights into your platform performance
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-stagger-children">
        <StatsCard
          title="Daily Active Users"
          value={analyticsData.dailyActiveUsers}
          icon={Users}
          format="number"
          color="violet"
        />
        <div onClick={handleNavigateToCoinTransactions} className="cursor-pointer">
          <StatsCard
            title="Coin Transactions"
            value={analyticsData.coinTransactions}
            icon={Coins}
            format="number"
            color="orange"
          />
        </div>
        <StatsCard
          title="Total Promoted"
          value={analyticsData.totalPromoted}
          icon={TrendingUp}
          format="number"
          color="emerald"
        />
        <StatsCard
          title="Videos Deleted"
          value={analyticsData.videosDeleted}
          icon={Video}
          format="number"
          color="blue"
        />
      </div>

      {/* Charts Grid - Enhanced for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Daily Active Users Chart */}
        <Card className="gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-violet-600 dark:text-violet-400 gaming-glow" />
              <span className="text-sm md:text-base">Daily Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="h-48 md:h-64 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                {hasUserGrowthData ? (
                  <AreaChart data={analyticsData.userGrowthData}>
                    <defs>
                      <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorActiveUsers)"
                    />
                  </AreaChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No user activity data available</p>
                    </div>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Video Promotion Chart - New */}
        <Card className="gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <Video className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 gaming-glow" />
              <span className="text-sm md:text-base">Video Promotions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="h-48 md:h-64 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                {hasVideoPromotionData ? (
                  <BarChart data={analyticsData.videoPromotionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="promotions" fill="#10b981" radius={[2, 2, 0, 0]} name="New Promotions" />
                    <Bar dataKey="completions" fill="#6366f1" radius={[2, 2, 0, 0]} name="Completions" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No video promotion data available</p>
                    </div>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coin Transactions Chart - Clickable */}
      <Card className="gaming-card-enhanced cursor-pointer hover:scale-[1.01] transition-all duration-300" onClick={handleNavigateToCoinTransactions}>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2 gaming-text-shadow">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400 gaming-glow" />
              <span className="text-sm md:text-base">Coin Transactions Overview</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
              <span className="text-xs md:text-sm">View Details</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              {hasCoinTransactionData ? (
                <BarChart data={analyticsData.coinTransactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="transactions" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Transactions" />
                  <Bar dataKey="volume" fill="#10b981" radius={[2, 2, 0, 0]} name="Volume" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No coin transaction data available</p>
                    <p className="text-xs mt-1">Click to view transaction details</p>
                  </div>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Enhanced for Mobile */}
      {hasRecentActivity && (
        <Card className="gaming-card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 gaming-glow" />
              <span className="text-sm md:text-base">Platform Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto gaming-scrollbar">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors gaming-interactive">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.type === 'user' ? 'bg-violet-500' :
                    activity.type === 'video' ? 'bg-emerald-500' :
                    activity.type === 'coin' ? 'bg-orange-500' : 'bg-blue-500'
                  } gaming-pulse`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                  {activity.value && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {activity.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {!hasUserGrowthData && !hasVideoPromotionData && !hasCoinTransactionData && !hasRecentActivity && (
        <Card className="gaming-card-enhanced">
          <CardHeader>
            <CardTitle>Analytics Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Analytics Data Available
              </h3>
              <p className="text-sm">
                Analytics data will be displayed here when your database contains sufficient activity data.
              </p>
              <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                The system automatically collects user activity, video promotions, and transactions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}