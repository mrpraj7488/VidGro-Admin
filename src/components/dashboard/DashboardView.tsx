import React, { useEffect } from 'react'
import { Users, Video, Crown, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { StatsCard } from './StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

export function DashboardView() {
  const { dashboardStats, chartData, isLoading, fetchDashboardStats } = useAdminStore()

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  if (isLoading || !dashboardStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
          <div className="h-80 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
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

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
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
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600" />
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
              <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50/70 transition-all duration-200 group">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'user' ? 'bg-violet-500' :
                  activity.type === 'vip' ? 'bg-yellow-500' :
                  activity.type === 'video' ? 'bg-emerald-500' :
                  activity.type === 'coin' ? 'bg-orange-500' : 'bg-blue-500'
                } shadow-sm`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{activity.amount}</span>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}