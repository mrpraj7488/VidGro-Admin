import React, { useEffect, useState } from 'react'
import { Coins, TrendingUp, DollarSign, Settings, AlertTriangle, Users } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { StatsCard } from '../dashboard/StatsCard'
import { formatNumber, formatCurrency } from '../../lib/utils'

export function EconomyView() {
  const { economyData, isLoading, fetchEconomyData, updateCoinSettings } = useAdminStore()
  const [editingSettings, setEditingSettings] = useState(false)
  const [settings, setSettings] = useState({
    coinPrice: 0.01,
    videoReward: 10,
    referralBonus: 50,
    vipMultiplier: 2.0
  })

  useEffect(() => {
    fetchEconomyData()
  }, [fetchEconomyData])

  useEffect(() => {
    if (economyData?.settings) {
      setSettings(economyData.settings)
    }
  }, [economyData])

  const handleSaveSettings = async () => {
    await updateCoinSettings(settings)
    setEditingSettings(false)
  }

  if (isLoading || !economyData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Economy Management</h1>
          <p className="text-gray-600">Monitor and control the platform's coin economy</p>
        </div>
        <Button
          onClick={() => setEditingSettings(!editingSettings)}
          variant={editingSettings ? "outline" : "default"}
          className="flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>{editingSettings ? 'Cancel' : 'Edit Settings'}</span>
        </Button>
      </div>

      {/* Economy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Coins in Circulation"
          value={economyData.totalCoinsCirculation}
          change={8.5}
          icon={Coins}
          color="orange"
        />
        <StatsCard
          title="Monthly Revenue"
          value={economyData.monthlyRevenue}
          change={12.3}
          icon={DollarSign}
          format="currency"
          color="emerald"
        />
        <StatsCard
          title="Coin Velocity"
          value={economyData.coinVelocity}
          change={-3.2}
          icon={TrendingUp}
          format="number"
          color="violet"
        />
        <StatsCard
          title="Active Spenders"
          value={economyData.activeSpenders}
          change={15.7}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Settings Panel */}
      {editingSettings && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Settings className="w-5 h-5" />
              <span>Economy Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coin Price (USD)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  value={settings.coinPrice}
                  onChange={(e) => setSettings({ ...settings, coinPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Reward (Coins)
                </label>
                <Input
                  type="number"
                  value={settings.videoReward}
                  onChange={(e) => setSettings({ ...settings, videoReward: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Bonus (Coins)
                </label>
                <Input
                  type="number"
                  value={settings.referralBonus}
                  onChange={(e) => setSettings({ ...settings, referralBonus: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIP Multiplier
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.vipMultiplier}
                  onChange={(e) => setSettings({ ...settings, vipMultiplier: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setEditingSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coin Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="w-5 h-5" />
              <span>Coin Flow Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={economyData.coinFlowData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                  dataKey="inflow"
                  stroke="#10b981"
                  fill="url(#colorInflow)"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="#ef4444"
                  fill="url(#colorOutflow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Revenue Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={economyData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="coinSales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="subscriptions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Economy Health Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Economy Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {economyData.healthIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      indicator.status === 'healthy' ? 'bg-emerald-500' :
                      indicator.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium text-gray-900">{indicator.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{indicator.value}</p>
                    <p className="text-xs text-gray-500">{indicator.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spenders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {economyData.topSpenders.map((spender, index) => (
                <div key={spender.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{spender.username}</p>
                    <p className="text-sm text-gray-500">{spender.videosPromoted} videos promoted</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-600">{formatNumber(spender.coinsSpent)}</p>
                    <p className="text-xs text-gray-500">coins</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {economyData.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}