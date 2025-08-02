import React, { useState, useEffect } from 'react'
import { Settings, Save, Shield, Bell, Database, Users, Video, Coins, Globe, ChevronRight } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'

export function SettingsView() {
  const { systemSettings, isLoading, fetchSystemSettings, updateSystemSettings } = useAdminStore()
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      platformName: 'VidGro',
      supportEmail: 'support@vidgro.com',
      maxVideoSize: 100,
      allowedVideoFormats: ['mp4', 'mov', 'avi'],
      maintenanceMode: false
    },
    users: {
      registrationEnabled: true,
      emailVerificationRequired: true,
      maxCoinsPerUser: 100000,
      vipUpgradePrice: 9.99,
      referralReward: 50
    },
    videos: {
      maxVideosPerUser: 10,
      autoModerationEnabled: true,
      minVideoLength: 10,
      maxVideoLength: 300,
      thumbnailRequired: true
    },
    economy: {
      coinPrice: 0.01,
      videoReward: 10,
      dailyBonusCoins: 5,
      vipMultiplier: 2.0,
      withdrawalMinimum: 1000
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      moderationAlerts: true,
      systemAlerts: true,
      weeklyReports: true
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      ipWhitelist: []
    }
  })

  useEffect(() => {
    fetchSystemSettings()
  }, [fetchSystemSettings])

  useEffect(() => {
    if (systemSettings) {
      setSettings(systemSettings)
    }
  }, [systemSettings])

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    await updateSystemSettings(settings)
    setHasChanges(false)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'economy', label: 'Economy', icon: Coins },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-96 bg-gray-200 animate-pulse rounded-xl" />
          <div className="lg:col-span-3 h-96 bg-gray-200 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Configure platform settings and preferences</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="flex items-center space-x-2 w-full sm:w-auto">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="xl:col-span-1">
          <CardContent className="p-0">
            <nav className="space-y-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-300 rounded-lg group ${
                      activeTab === tab.id
                        ? 'bg-violet-500/20 dark:bg-violet-500/30 text-violet-700 dark:text-violet-300 border-l-4 border-violet-600 dark:border-violet-400 shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 transition-colors ${
                        activeTab === tab.id 
                          ? 'text-violet-600 dark:text-violet-400' 
                          : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`} />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform xl:hidden ${
                      activeTab === tab.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="xl:col-span-3">
          <Card className="gaming-card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Settings, { className: "w-5 h-5" })}
                <span>{tabs.find(t => t.id === activeTab)?.label} Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Platform Name
                      </label>
                      <Input
                        value={settings.general.platformName}
                        onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Support Email
                      </label>
                      <Input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Video Size (MB)
                      </label>
                      <Input
                        type="number"
                        value={settings.general.maxVideoSize}
                        onChange={(e) => handleSettingChange('general', 'maxVideoSize', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maintenance Mode
                      </label>
                      <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Enable maintenance mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Settings */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Registration
                      </label>
                      <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                        <input
                          type="checkbox"
                          checked={settings.users.registrationEnabled}
                          onChange={(e) => handleSettingChange('users', 'registrationEnabled', e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Allow new user registration</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Verification
                      </label>
                      <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                        <input
                          type="checkbox"
                          checked={settings.users.emailVerificationRequired}
                          onChange={(e) => handleSettingChange('users', 'emailVerificationRequired', e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Require email verification</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Coins Per User
                      </label>
                      <Input
                        type="number"
                        value={settings.users.maxCoinsPerUser}
                        onChange={(e) => handleSettingChange('users', 'maxCoinsPerUser', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        VIP Upgrade Price ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.users.vipUpgradePrice}
                        onChange={(e) => handleSettingChange('users', 'vipUpgradePrice', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Video Settings */}
              {activeTab === 'videos' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Videos Per User
                      </label>
                      <Input
                        type="number"
                        value={settings.videos.maxVideosPerUser}
                        onChange={(e) => handleSettingChange('videos', 'maxVideosPerUser', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Auto Moderation
                      </label>
                      <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                        <input
                          type="checkbox"
                          checked={settings.videos.autoModerationEnabled}
                          onChange={(e) => handleSettingChange('videos', 'autoModerationEnabled', e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Enable automatic content moderation</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Video Length (seconds)
                      </label>
                      <Input
                        type="number"
                        value={settings.videos.minVideoLength}
                        onChange={(e) => handleSettingChange('videos', 'minVideoLength', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Video Length (seconds)
                      </label>
                      <Input
                        type="number"
                        value={settings.videos.maxVideoLength}
                        onChange={(e) => handleSettingChange('videos', 'maxVideoLength', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Economy Settings */}
              {activeTab === 'economy' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Coin Price (USD)
                      </label>
                      <Input
                        type="number"
                        step="0.001"
                        value={settings.economy.coinPrice}
                        onChange={(e) => handleSettingChange('economy', 'coinPrice', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Video Reward (Coins)
                      </label>
                      <Input
                        type="number"
                        value={settings.economy.videoReward}
                        onChange={(e) => handleSettingChange('economy', 'videoReward', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Daily Bonus Coins
                      </label>
                      <Input
                        type="number"
                        value={settings.economy.dailyBonusCoins}
                        onChange={(e) => handleSettingChange('economy', 'dailyBonusCoins', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        VIP Multiplier
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.economy.vipMultiplier}
                        onChange={(e) => handleSettingChange('economy', 'vipMultiplier', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 gaming-card rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'emailNotifications' && 'Send email notifications to users'}
                            {key === 'pushNotifications' && 'Send push notifications to mobile devices'}
                            {key === 'moderationAlerts' && 'Alert moderators of new content to review'}
                            {key === 'systemAlerts' && 'Send system status and error alerts'}
                            {key === 'weeklyReports' && 'Send weekly analytics reports to admins'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Two-Factor Authentication
                      </label>
                      <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorRequired}
                          onChange={(e) => handleSettingChange('security', 'twoFactorRequired', e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for all admin accounts</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Timeout (hours)
                      </label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Login Attempts
                      </label>
                      <Input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password Min Length
                      </label>
                      <Input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleSettingChange('security', 'passwordMinLength', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}