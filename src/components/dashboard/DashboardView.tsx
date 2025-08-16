import React, { useEffect, useState } from 'react'
import { Users, Video, Crown, DollarSign, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { StatsCard } from './StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { format, subDays } from 'date-fns'

// Helper function to get admin client
function getSupabaseAdminClient() {
  const { getSupabaseAdminClient } = require('../../lib/supabase')
  return getSupabaseAdminClient()
}

export function DashboardView() {
  const { 
    dashboardStats, 
    chartData, 
    dashboardLoading, 
    fetchDashboardStats,
    analyticsData,
    fetchAnalytics
  } = useAdminStore()

  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading dashboard data...')
        await Promise.all([
          fetchDashboardStats(),
          fetchAnalytics([subDays(new Date(), 30), new Date()])
        ])
        console.log('Dashboard data loaded successfully')
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
      setLastRefresh(new Date())
    }
    
    loadData()
  }, [fetchDashboardStats, fetchAnalytics])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      console.log('Refreshing dashboard data...')
      await Promise.all([
        fetchDashboardStats(),
        fetchAnalytics([subDays(new Date(), 30), new Date()])
      ])
      console.log('Dashboard data refreshed successfully')
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Generate mock chart data if real data is not available
  const generateMockChartData = () => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i)
      data.push({
        date: format(date, 'MMM dd'),
        users: Math.floor(Math.random() * 50) + 20,
        videos: Math.floor(Math.random() * 30) + 10,
        coins: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.floor(Math.random() * 500) + 200
      })
    }
    return data
  }

  const mockChartData = generateMockChartData()
  const hasRealChartData = analyticsData?.userGrowthData && analyticsData.userGrowthData.length > 0
  const displayChartData = hasRealChartData ? analyticsData.userGrowthData : mockChartData

  if (dashboardLoading && !dashboardStats) {
    return (
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        {/* Mobile-optimized loading skeleton */}
        <div className="flex flex-col space-y-2">
          <div className="h-6 md:h-8 bg-gray-200 dark:bg-slate-700 animate-pulse rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 animate-pulse rounded w-64" />
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
      const hasVideoPromotionData = false // Will be implemented when videoPromotionData is added to AnalyticsData
      const hasCoinTransactionData = analyticsData.coinTransactionData && analyticsData.coinTransactionData.length > 0
  }
      
      console.log('Dashboard data availability:', {
        hasUserGrowthData,
        hasVideoPromotionData,
        hasCoinTransactionData,
        hasRecentActivity,
        userGrowthDataLength: analyticsData.userGrowthData?.length || 0,
        coinTransactionDataLength: analyticsData.coinTransactionData?.length || 0,
        recentActivityLength: analyticsData.recentActivity?.length || 0
      })

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold gaming-gradient-text gaming-text-shadow">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Overview of your VidGro platform
          </p>
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sm:hidden">Refresh</span>
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-stagger-children">
        <StatsCard
          title="Total Users"
          value={dashboardStats?.total_users || 0}
          change={dashboardStats?.user_growth_rate}
          icon={Users}
          color="violet"
        />
        <StatsCard
          title="Active Videos"
          value={dashboardStats?.active_videos || 0}
          icon={Video}
          color="orange"
        />
        <StatsCard
          title="VIP Users"
          value={dashboardStats?.vip_users || 0}
          icon={Crown}
          color="emerald"
        />
        <StatsCard
          title="Monthly Revenue"
          value={dashboardStats?.monthly_revenue || 0}
          icon={DollarSign}
          format="currency"
          color="blue"
        />
      </div>


      {/* Charts Section - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* User Growth Chart */}
        <Card className="gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 gaming-text-shadow">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-violet-600 dark:text-violet-400 gaming-glow" />
                <span className="text-sm md:text-base">User Growth</span>
              </div>
              {!hasRealChartData && (
                <div className="text-xs text-orange-500 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                  Demo Data
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="h-48 md:h-64 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                {hasUserGrowthData ? (
                  <BarChart data={analyticsData.userGrowthData.map(item => ({
                    date: item.date,
                    promotions: Math.floor(item.activeUsers * 0.3), // Mock promotions based on active users
                    completions: Math.floor(item.activeUsers * 0.2) // Mock completions
                  }))}>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey={hasRealChartData ? "activeUsers" : "users"}
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    <p className="text-sm">Loading coin transaction data...</p>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 gaming-glow" />
              <span className="text-sm md:text-base">Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
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
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Data Status Alert */}
      {!hasRealChartData && (
        <Card className="gaming-card-enhanced border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800 dark:text-orange-300 text-sm md:text-base">
                  Demo Data Mode
                </h4>
                <p className="text-xs md:text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Charts are showing demo data. Real analytics will be displayed when your database contains sufficient data.
                  The system is automatically collecting user activity and will populate charts as data becomes available.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}