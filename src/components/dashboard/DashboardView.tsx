import React, { useEffect, useState } from 'react'
import { Users, Video, Crown, DollarSign, TrendingUp, Activity, RefreshCw, AlertTriangle, BarChart3 } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { StatsCard } from './StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { format, subDays } from 'date-fns'

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
      await Promise.all([
        fetchDashboardStats(),
        fetchAnalytics([subDays(new Date(), 30), new Date()])
      ])
      setLastRefresh(new Date())
    }
    
    loadData()
  }, [fetchDashboardStats, fetchAnalytics])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchAnalytics([subDays(new Date(), 30), new Date()])
      ])
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
      </div>
    )
  }

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

      {/* Secondary Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-violet-600 dark:text-violet-400">
              {dashboardStats?.daily_active_users || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Daily Active</div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {dashboardStats?.coin_transactions || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Coin Transactions</div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {dashboardStats?.pending_videos || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pending Videos</div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(dashboardStats?.video_completion_rate || 0)}%
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Mobile Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
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
                <AreaChart data={displayChartData}>
                  <defs>
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Activity Chart */}
        <Card className="gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 gaming-text-shadow">
                <Activity className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 gaming-glow" />
                <span className="text-sm md:text-base">Platform Activity</span>
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
                <BarChart data={displayChartData.slice(-7)}>
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
                  <Bar dataKey="videos" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="coins" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Transactions Chart - Mobile Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
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

        {/* Activity Distribution Pie Chart */}
        <Card className="gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 gaming-glow" />
              <span className="text-sm md:text-base">Activity Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Video Views', value: dashboardStats?.active_videos || 45, fill: '#6366f1' },
                      { name: 'User Signups', value: dashboardStats?.daily_active_users || 30, fill: '#10b981' },
                      { name: 'Coin Transactions', value: dashboardStats?.coin_transactions || 25, fill: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Video Views', value: dashboardStats?.active_videos || 45, fill: '#6366f1' },
                      { name: 'User Signups', value: dashboardStats?.daily_active_users || 30, fill: '#10b981' },
                      { name: 'Coin Transactions', value: dashboardStats?.coin_transactions || 25, fill: '#f59e0b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend for mobile */}
            <div className="flex flex-wrap justify-center gap-2 mt-2 md:mt-4">
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Videos</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Users</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Transactions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm md:text-base">Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="space-y-3 max-h-48 md:max-h-64 overflow-y-auto gaming-scrollbar">
              {analyticsData?.recentActivity && analyticsData.recentActivity.length > 0 ? (
                analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 md:p-3 rounded-lg hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === 'user' ? 'bg-violet-500' :
                      activity.type === 'video' ? 'bg-emerald-500' :
                      activity.type === 'coin' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {activity.value}
                    </span>
                  </div>
                ))
              ) : (
                // Mock recent activity for demo
                [
                  { type: 'user', description: 'New user registered', timestamp: '2 minutes ago', value: '+1' },
                  { type: 'video', description: 'Video promotion completed', timestamp: '5 minutes ago', value: '1.2K views' },
                  { type: 'coin', description: 'Coins purchased', timestamp: '8 minutes ago', value: '+500' },
                  { type: 'user', description: 'VIP upgrade', timestamp: '12 minutes ago', value: '$9.99' },
                  { type: 'video', description: 'Video approved', timestamp: '15 minutes ago', value: 'Approved' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 md:p-3 rounded-lg hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === 'user' ? 'bg-violet-500' :
                      activity.type === 'video' ? 'bg-emerald-500' :
                      activity.type === 'coin' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {activity.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="gaming-card-enhanced">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm md:text-base">Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto p-3 md:p-4"
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'users' }))}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs md:text-sm font-medium">Manage Users</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">View and edit user accounts</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto p-3 md:p-4"
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'videos' }))}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs md:text-sm font-medium">Review Videos</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Moderate video content</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto p-3 md:p-4"
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'analytics' }))}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs md:text-sm font-medium">View Analytics</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Detailed platform insights</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto p-3 md:p-4"
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'settings' }))}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs md:text-sm font-medium">System Config</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Configure platform settings</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status - Mobile Responsive */}
      <Card className="gaming-card-enhanced">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2 gaming-text-shadow">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm md:text-base">System Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full gaming-pulse"></div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All Systems Operational</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="text-center p-3 gaming-card">
              <div className="text-lg md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.9%</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center p-3 gaming-card">
              <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardStats?.total_transactions || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">API Calls</div>
            </div>
            <div className="text-center p-3 gaming-card">
              <div className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">45ms</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Response Time</div>
            </div>
            <div className="text-center p-3 gaming-card">
              <div className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

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