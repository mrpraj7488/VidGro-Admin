import React, { useState, useEffect } from 'react'
import { Settings, Save, Database, Smartphone, DollarSign, Globe, Shield, Bell, Download, CheckCircle, AlertTriangle, Copy, Eye, EyeOff } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { envManager, EnvironmentVariables } from '../../lib/envManager'

export function SystemConfigView() {
  const { systemSettings, isLoading, fetchSystemSettings, updateEnvironmentVars, updateAdsConfig, updateSystemSettings } = useAdminStore()
  const [activeTab, setActiveTab] = useState('environment')
  const [hasChanges, setHasChanges] = useState(false)
  const [envVars, setEnvVars] = useState<EnvironmentVariables>(envManager.getEnvironmentVariables())
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState(systemSettings)
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({})

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
    if (activeTab === 'environment') {
      setIsSaving(true)
      try {
        const result = await envManager.saveEnvironmentVariables(envVars)
        setSaveStatus({
          type: result.success ? 'success' : 'error',
          message: result.message
        })
        if (result.success) {
          setHasChanges(false)
          // Update the admin store as well
          await updateEnvironmentVars(envVars)
        }
      } catch (error) {
        setSaveStatus({
          type: 'error',
          message: 'Failed to save environment variables. Please try again.'
        })
      } finally {
        setIsSaving(false)
        // Clear status after 5 seconds
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000)
      }
    } else if (activeTab === 'ads') {
      await updateAdsConfig(settings.ads)
      setHasChanges(false)
    } else {
      await updateSystemSettings(settings)
      setHasChanges(false)
    }
  }

  const handleEnvVarChange = (key: keyof EnvironmentVariables, value: string) => {
    setEnvVars(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleCopyToClipboard = (text: string) => {
    if (!text || text.trim() === '' || text.startsWith('your_')) {
      setSaveStatus({
        type: 'error',
        message: 'No value to copy. Please enter a valid value first.'
      })
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000)
      return
    }
    
    navigator.clipboard.writeText(text)
    setSaveStatus({
      type: 'success',
      message: 'Copied to clipboard!'
    })
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 2000)
  }

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  const configStatus = envManager.getConfigurationStatus()

  const tabs = [
    { id: 'environment', label: 'Environment Variables', icon: Database },
    { id: 'ads', label: 'Ads Configuration', icon: Smartphone },
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'economy', label: 'Economy Settings', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-96 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
          <div className="lg:col-span-3 h-96 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Configuration</h1>
          <p className="text-gray-600 dark:text-gray-300">Configure platform settings and environment variables</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'environment' && (
            <Button
              variant="outline"
              onClick={() => envManager.downloadEnvFile()}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download .env</span>
            </Button>
          )}
          {hasChanges && (
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Save Status Message */}
      {saveStatus.type && (
        <Card className={`border-2 ${
          saveStatus.type === 'success' 
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20' 
            : 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {saveStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p className={`font-medium ${
                saveStatus.type === 'success' 
                  ? 'text-emerald-800 dark:text-emerald-300' 
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {saveStatus.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="h-fit">
          <CardContent className="p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-400 border-r-2 border-violet-600 dark:from-violet-500/20 dark:to-purple-500/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Settings, { className: "w-5 h-5" })}
                <span>{tabs.find(t => t.id === activeTab)?.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Environment Variables */}
              {activeTab === 'environment' && (
                <div className="space-y-6">
                  {/* Configuration Status */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-violet-800 dark:text-violet-300 flex items-center">
                        <Database className="w-4 h-4 mr-2" />
                        Configuration Status
                      </h4>
                      <Badge 
                        variant={configStatus.isConfigured ? "success" : "warning"}
                        className="font-medium"
                      >
                        {configStatus.isConfigured ? 'Fully Configured' : `${configStatus.missingVars.length} Missing`}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-violet-700 dark:text-violet-300 font-medium mb-1">Configured Variables</p>
                        <p className="text-violet-600 dark:text-violet-400">{configStatus.configuredVars.length} / {Object.keys(envVars).length}</p>
                      </div>
                      <div>
                        <p className="text-violet-700 dark:text-violet-300 font-medium mb-1">Status</p>
                        <p className="text-violet-600 dark:text-violet-400">
                          {configStatus.isConfigured ? 'Ready for production' : 'Requires configuration'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Supabase Configuration
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          VITE_SUPABASE_URL
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={envVars.VITE_SUPABASE_URL}
                            onChange={(e) => handleEnvVarChange('VITE_SUPABASE_URL', e.target.value)}
                            placeholder="https://your-project.supabase.co"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_SUPABASE_URL)}
                            disabled={!envVars.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          VITE_SUPABASE_ANON_KEY
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={visibleSecrets['VITE_SUPABASE_ANON_KEY'] ? "text" : "password"}
                            value={envVars.VITE_SUPABASE_ANON_KEY}
                            onChange={(e) => handleEnvVarChange('VITE_SUPABASE_ANON_KEY', e.target.value)}
                            className="font-mono text-sm"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility('VITE_SUPABASE_ANON_KEY')}
                          >
                            {visibleSecrets['VITE_SUPABASE_ANON_KEY'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_SUPABASE_ANON_KEY)}
                            disabled={!envVars.VITE_SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_ANON_KEY.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          VITE_SUPABASE_SERVICE_ROLE_KEY
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={visibleSecrets['VITE_SUPABASE_SERVICE_ROLE_KEY'] ? "text" : "password"}
                            value={envVars.VITE_SUPABASE_SERVICE_ROLE_KEY}
                            onChange={(e) => handleEnvVarChange('VITE_SUPABASE_SERVICE_ROLE_KEY', e.target.value)}
                            className="font-mono text-sm"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility('VITE_SUPABASE_SERVICE_ROLE_KEY')}
                          >
                            {visibleSecrets['VITE_SUPABASE_SERVICE_ROLE_KEY'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_SUPABASE_SERVICE_ROLE_KEY)}
                            disabled={!envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_SERVICE_ROLE_KEY.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                          VITE_ADMIN_EMAIL
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="email"
                            value={envVars.VITE_ADMIN_EMAIL}
                            onChange={(e) => handleEnvVarChange('VITE_ADMIN_EMAIL', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="admin@vidgro.com"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_ADMIN_EMAIL)}
                            disabled={!envVars.VITE_ADMIN_EMAIL || envVars.VITE_ADMIN_EMAIL.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                          VITE_ADMIN_SECRET_KEY
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={visibleSecrets['VITE_ADMIN_SECRET_KEY'] ? "text" : "password"}
                            value={envVars.VITE_ADMIN_SECRET_KEY}
                            onChange={(e) => handleEnvVarChange('VITE_ADMIN_SECRET_KEY', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="your_admin_secret_key"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility('VITE_ADMIN_SECRET_KEY')}
                          >
                            {visibleSecrets['VITE_ADMIN_SECRET_KEY'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_ADMIN_SECRET_KEY)}
                            disabled={!envVars.VITE_ADMIN_SECRET_KEY || envVars.VITE_ADMIN_SECRET_KEY.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      App Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                          VITE_APP_NAME
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={envVars.VITE_APP_NAME}
                            onChange={(e) => handleEnvVarChange('VITE_APP_NAME', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="VidGro Admin Panel"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_APP_NAME)}
                            disabled={!envVars.VITE_APP_NAME || envVars.VITE_APP_NAME.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                          VITE_API_BASE_URL
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={envVars.VITE_API_BASE_URL}
                            onChange={(e) => handleEnvVarChange('VITE_API_BASE_URL', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="https://your-api-domain.com"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_API_BASE_URL)}
                            disabled={!envVars.VITE_API_BASE_URL || envVars.VITE_API_BASE_URL.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Firebase Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          VITE_FIREBASE_PROJECT_ID
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={envVars.VITE_FIREBASE_PROJECT_ID}
                            onChange={(e) => handleEnvVarChange('VITE_FIREBASE_PROJECT_ID', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="your_firebase_project_id"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_FIREBASE_PROJECT_ID)}
                            disabled={!envVars.VITE_FIREBASE_PROJECT_ID || envVars.VITE_FIREBASE_PROJECT_ID.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          VITE_FIREBASE_CLIENT_EMAIL
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="email"
                            value={envVars.VITE_FIREBASE_CLIENT_EMAIL}
                            onChange={(e) => handleEnvVarChange('VITE_FIREBASE_CLIENT_EMAIL', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="your_firebase_client_email"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_FIREBASE_CLIENT_EMAIL)}
                            disabled={!envVars.VITE_FIREBASE_CLIENT_EMAIL || envVars.VITE_FIREBASE_CLIENT_EMAIL.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          VITE_FIREBASE_PRIVATE_KEY
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={visibleSecrets['VITE_FIREBASE_PRIVATE_KEY'] ? "text" : "password"}
                            value={envVars.VITE_FIREBASE_PRIVATE_KEY}
                            onChange={(e) => handleEnvVarChange('VITE_FIREBASE_PRIVATE_KEY', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="your_firebase_private_key"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility('VITE_FIREBASE_PRIVATE_KEY')}
                          >
                            {visibleSecrets['VITE_FIREBASE_PRIVATE_KEY'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_FIREBASE_PRIVATE_KEY)}
                            disabled={!envVars.VITE_FIREBASE_PRIVATE_KEY || envVars.VITE_FIREBASE_PRIVATE_KEY.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          VITE_FCM_SERVER_KEY
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={visibleSecrets['VITE_FCM_SERVER_KEY'] ? "text" : "password"}
                            value={envVars.VITE_FCM_SERVER_KEY}
                            onChange={(e) => handleEnvVarChange('VITE_FCM_SERVER_KEY', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="your_fcm_server_key"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility('VITE_FCM_SERVER_KEY')}
                          >
                            {visibleSecrets['VITE_FCM_SERVER_KEY'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_FCM_SERVER_KEY)}
                            disabled={!envVars.VITE_FCM_SERVER_KEY || envVars.VITE_FCM_SERVER_KEY.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                          VITE_JWT_SECRET
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={visibleSecrets['VITE_JWT_SECRET'] ? "text" : "password"}
                            value={envVars.VITE_JWT_SECRET}
                            onChange={(e) => handleEnvVarChange('VITE_JWT_SECRET', e.target.value)}
                            className="font-mono text-sm flex-1"
                            placeholder="your_jwt_secret_key"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility('VITE_JWT_SECRET')}
                          >
                            {visibleSecrets['VITE_JWT_SECRET'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.VITE_JWT_SECRET)}
                            disabled={!envVars.VITE_JWT_SECRET || envVars.VITE_JWT_SECRET.startsWith('your_')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                          NODE_ENV
                        </label>
                        <div className="flex items-center space-x-2">
                          <select
                            value={envVars.NODE_ENV}
                            onChange={(e) => handleEnvVarChange('NODE_ENV', e.target.value)}
                            className="flex-1 px-3 py-2 border border-red-300 rounded-lg bg-white text-sm dark:bg-slate-800 dark:border-red-600 dark:text-white"
                          >
                            <option value="development">Development</option>
                            <option value="production">Production</option>
                            <option value="staging">Staging</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(envVars.NODE_ENV)}
                            disabled={!envVars.NODE_ENV}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ads Configuration */}
              {activeTab === 'ads' && (
                <div className="space-y-6">
                  <div className="space-y-6">
                    {/* Ad Status Controls */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800/50 rounded-xl p-6">
                      <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-4 flex items-center">
                        <Smartphone className="w-5 h-5 mr-2" />
                        Ad Status Controls
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries({
                          bannerAdsEnabled: { label: 'Banner Ads', desc: 'Display banner ads in the app' },
                          interstitialAdsEnabled: { label: 'Interstitial Ads', desc: 'Show full-screen ads between content' },
                          rewardedAdsEnabled: { label: 'Rewarded Ads', desc: 'Offer rewarded video ads for coins' }
                        }).map(([key, { label, desc }]) => (
                          <div key={key} className="gaming-card p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900 dark:text-white">{label}</h5>
                              {/* Gaming Toggle Switch */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => handleSettingChange('ads', key, !settings.ads[key])}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                                    settings.ads[key]
                                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                                      : 'bg-gray-300 dark:bg-gray-600'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                      settings.ads[key] ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                            <div className={`mt-2 text-xs font-medium ${
                              settings.ads[key] 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {settings.ads[key] ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ad Settings */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Ad Configuration Settings
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                            Ad Frequency (minutes)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            value={settings.ads.adFrequencyMinutes}
                            onChange={(e) => handleSettingChange('ads', 'adFrequencyMinutes', Number(e.target.value))}
                            className="border-emerald-300 focus:border-emerald-500 dark:border-emerald-700"
                          />
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Minimum time between interstitial ads</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                            Revenue Share (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={settings.ads.revenueSharePercent}
                            onChange={(e) => handleSettingChange('ads', 'revenueSharePercent', Number(e.target.value))}
                            className="border-emerald-300 focus:border-emerald-500 dark:border-emerald-700"
                          />
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Percentage of ad revenue shared with users</p>
                        </div>
                      </div>
                    </div>

                    {/* Ad Performance Summary */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-6">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Current Ad Performance
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="gaming-metric p-4 text-center">
                          <div className="gaming-metric-value !text-xl">$2,847</div>
                          <div className="text-sm text-orange-600 dark:text-orange-400">Monthly Revenue</div>
                        </div>
                        <div className="gaming-metric p-4 text-center">
                          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 gaming-glow">94.2%</div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-400">Fill Rate</div>
                        </div>
                        <div className="gaming-metric p-4 text-center">
                          <div className="text-xl font-bold text-violet-600 dark:text-violet-400 gaming-glow">1.8M</div>
                          <div className="text-sm text-violet-600 dark:text-violet-400">Impressions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Enable maintenance mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Economy Settings */}
              {activeTab === 'economy' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Configuration
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-red-700 dark:text-red-300">Two-Factor Authentication</h5>
                          <p className="text-sm text-red-600 dark:text-red-400">Require 2FA for all admin accounts</p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded border-red-300 text-red-600 focus:ring-red-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                            Session Timeout (hours)
                          </label>
                          <Input
                            type="number"
                            defaultValue={24}
                            className="border-red-300 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                            Max Login Attempts
                          </label>
                          <Input
                            type="number"
                            defaultValue={5}
                            className="border-red-300 focus:border-red-500"
                          />
                        </div>
                      </div>
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