import React, { useEffect, useState } from 'react'
import { Calendar, Download, TrendingUp, Users, Coins, BarChart3, Video } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { DateRangePicker } from '../ui/DateRangePicker'
import { StatsCard } from '../dashboard/StatsCard'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function AnalyticsView() {
  const { analyticsData, isLoading, fetchAnalytics } = useAdminStore()
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  ])

  useEffect(() => {
    fetchAnalytics(dateRange)
  }, [fetchAnalytics, dateRange])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-down">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-stagger-children">
        {analyticsData ? (
          <>
            <StatsCard
              title="Daily Active Users"
              value={analyticsData.dailyActiveUsers}
              change={12.5}
              icon={Users}
              format="number"
              color="violet"
            />
            <StatsCard
              title="Coin Transactions"
              value={analyticsData.coinTransactions}
              change={15.7}
              icon={Coins}
              format="number"
              color="orange"
            />
            <StatsCard
              title="Total Promoted"
              value={analyticsData.totalPromoted || 2847}
              change={8.3}
              icon={TrendingUp}
              format="number"
              color="emerald"
            />
            <StatsCard
              title="Videos Deleted"
              value={analyticsData.videosDeleted || 156}
              change={-2.1}
              icon={Video}
              format="number"
              color="blue"
            />
          </>
        ) : (
          <>
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-stagger-children">
        {analyticsData ? (
          <>
            {/* Daily Active Users Chart */}
            <Card className="dark:bg-slate-800/95 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Daily Active Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.userGrowthData}>
                    <defs>
                      <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
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
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Coin Transactions Chart */}
            <Card className="dark:bg-slate-800/95 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="w-5 h-5" />
                  <span>Coin Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.coinTransactionData}>
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
                    <Bar dataKey="transactions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="dark:bg-slate-800/95">
              <CardHeader>
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800/95">
              <CardHeader>
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-stagger-children">
        {analyticsData ? (
          <>
            {/* Top Performing Videos */}
            <Card className="dark:bg-slate-800/95 animate-slide-up">
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topVideos.map((video, index) => (
                    <div key={video.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{video.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{video.views} views • {video.completionRate}% completion</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600 dark:text-orange-400">{video.coinsEarned}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">coins</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="dark:bg-slate-800/95 animate-slide-up">
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'user' ? 'bg-violet-500' :
                        activity.type === 'video' ? 'bg-emerald-500' :
                        activity.type === 'coin' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{activity.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="dark:bg-slate-800/95">
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center space-x-4 p-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800/95">
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center space-x-4 p-3">
                      <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                      <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
          change={15.7}
          icon={Coins}
          format="number"
          color="orange"
        />
        <StatsCard
          title="Total Promoted"
          value={analyticsData.totalPromoted || 2847}
          change={8.3}
          icon={TrendingUp}
          format="number"
          color="emerald"
        />
        <StatsCard
          title="Videos Deleted"
          value={analyticsData.videosDeleted || 156}
          change={-2.1}
          icon={Video}
          format="number"
          color="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-stagger-children">
        {/* Daily Active Users Chart */}
        <Card className="dark:bg-slate-800/95 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Daily Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.userGrowthData}>
                <defs>
                  <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
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
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Coin Transactions Chart */}
        <Card className="dark:bg-slate-800/95 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="w-5 h-5" />
              <span>Coin Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.coinTransactionData}>
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
                <Bar dataKey="transactions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-stagger-children">
        {/* Top Performing Videos */}
        <Card className="dark:bg-slate-800/95 animate-slide-up">
          <CardHeader>
            <CardTitle>Top Performing Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topVideos.map((video, index) => (
                <div key={video.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{video.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{video.views} views • {video.completionRate}% completion</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-600 dark:text-orange-400">{video.coinsEarned}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">coins</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="dark:bg-slate-800/95 animate-slide-up">
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-violet-500' :
                    activity.type === 'video' ? 'bg-emerald-500' :
                    activity.type === 'coin' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{activity.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}