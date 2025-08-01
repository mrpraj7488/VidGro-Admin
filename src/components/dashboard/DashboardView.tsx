import React, { useEffect, useState } from 'react'
import { Users, Video, Crown, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { StatsCard } from './StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'

export function DashboardView() {
  const { 
    dashboardStats, 
    chartData, 
    realtimeStats, 
    connectionStatus, 
    isLoading, 
    fetchDashboardStats,
    initializeRealtime,
    disconnectRealtime
  } = useAdminStore()
  
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchDashboardStats()
    initializeRealtime()
    
    // Update timestamp periodically
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString())
    }, 1000)
    
    return () => {
      clearInterval(interval)
      disconnectRealtime()
    }
  }, [fetchDashboardStats])

  if (isLoading || !dashboardStats) {
    return (
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 gaming-skeleton rounded" />
          <div className="h-6 w-32 gaming-skeleton rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 gaming-skeleton rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 gaming-skeleton rounded-xl" />
          <div className="h-80 gaming-skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Real-time overview of your VidGro platform</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            variant={connectionStatus ? "success" : "danger"}
            className="flex items-center space-x-2"
          >
            <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span>{connectionStatus ? 'Live' : 'Disconnected'}</span>
          </Badge>
          {lastUpdate && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated: {lastUpdate}
            </span>
          )}
        </div>
      </div>

      {/* Real-time Metrics */}
      {realtimeStats && Object.keys(realtimeStats).length > 0 && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-300 mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2 animate-pulse" />
            Live Activity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {realtimeStats.onlineUsers || 0}
              </div>
              <div className="text-sm text-violet-600 dark:text-violet-400">Online Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {realtimeStats.videosWatchedLastHour || 0}
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">Videos/Hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {realtimeStats.coinsEarnedLastHour || 0}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Coins/Hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {realtimeStats.newUsersToday || 0}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">New Today</div>
            </div>
          </div>
          {realtimeStats.lastTransaction && (
            <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-800/50">
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                <span className="text-gray-600 dark:text-gray-300">
                  Latest: {realtimeStats.lastTransaction.type} of {realtimeStats.lastTransaction.amount} coins
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(realtimeStats.lastTransaction.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Clean Stats Cards - Only 4 Essential Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          change={12.5}
          icon={Users}
          color="violet"
        />
        <StatsCard
          title="Active Videos"
          value={dashboardStats.activeVideos}
          change={15.2}
          icon={Video}
          color="orange"
        />
        <StatsCard
          title="VIP Users"
          value={dashboardStats.vipUsers}
          change={8.3}
          icon={Crown}
          color="emerald"
        />
        <StatsCard
          title="Monthly Revenue"
          value={dashboardStats.monthlyRevenue}
          change={15.2}
          icon={DollarSign}
          format="currency"
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gaming-float">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
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
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gaming-float">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
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
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="videos" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="coins" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400 gaming-glow" />
            <span>Recent Platform Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New VIP user upgraded', user: 'user123', time: '2 minutes ago', type: 'vip', amount: '$9.99' },
              { action: 'Video promotion started', user: 'creator456', time: '5 minutes ago', type: 'video', amount: '500 coins' },
              { action: 'Bulk coin purchase', user: 'user789', time: '8 minutes ago', type: 'coin', amount: '$49.99' },
              { action: 'Video completed promotion', user: 'creator101', time: '12 minutes ago', type: 'promotion', amount: '1.2K views' },
              { action: 'New user registered', user: 'user202', time: '15 minutes ago', type: 'user', amount: '50 bonus coins' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-violet-500/10 transition-all duration-200 group gaming-interactive">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'user' ? 'bg-violet-500' :
                  activity.type === 'vip' ? 'bg-yellow-500' :
                  activity.type === 'video' ? 'bg-emerald-500' :
                  activity.type === 'coin' ? 'bg-orange-500' : 'bg-blue-500'
                } shadow-sm gaming-pulse`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors gaming-glow">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">by {activity.user}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{activity.amount}</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}