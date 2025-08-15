import React, { useEffect } from 'react'
import { Users, Video, Crown, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { StatsCard } from './StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

export function DashboardView() {
  const { 
    dashboardStats, 
    chartData, 
    dashboardLoading, 
    fetchDashboardStats
  } = useAdminStore()

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  if (dashboardLoading || !dashboardStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          <div className="h-80 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  // Only show charts if we have real data
  const hasChartData = chartData && chartData.length > 0

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gaming-gradient-text gaming-text-shadow">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Overview of your VidGro platform</p>
      </div>

      {/* Stats Cards */}
      <div className="gaming-stats-grid">
        <StatsCard
          title="Total Users"
          value={dashboardStats.total_users}
          icon={Users}
          color="violet"
        />
        <StatsCard
          title="Active Videos"
          value={dashboardStats.active_videos}
          icon={Video}
          color="orange"
        />
        <StatsCard
          title="VIP Users"
          value={dashboardStats.vip_users}
          icon={Crown}
          color="emerald"
        />
        <StatsCard
          title="Monthly Revenue"
          value={dashboardStats.monthly_revenue}
          icon={DollarSign}
          format="currency"
          color="blue"
        />
      </div>

      {/* Charts - Only show if we have real data */}
      {hasChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
                <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400 gaming-glow" />
                <span>User Growth Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400 gaming-glow" />
                <span>Platform Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="videos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="coins" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data Message - Show when no chart data is available */}
      {!hasChartData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 gaming-text-shadow">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400 gaming-glow" />
              <span>Data Availability</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chart data will be displayed here when available</p>
              <p className="text-sm mt-2">Data is automatically populated from your database</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Stats - Only show if we have meaningful data */}
      {(dashboardStats.pending_videos > 0 || dashboardStats.daily_active_users > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardStats.pending_videos > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-orange-600" />
                  <span>Pending Videos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{dashboardStats.pending_videos}</div>
                <p className="text-sm text-gray-500">Videos awaiting approval</p>
              </CardContent>
            </Card>
          )}
          
          {dashboardStats.daily_active_users > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  <span>Daily Active Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-600">{dashboardStats.daily_active_users}</div>
                <p className="text-sm text-gray-500">Users active in last 24 hours</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
