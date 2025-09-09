import React, { useState, useEffect } from 'react'
import { Save, Download, Upload, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { envManager, EnvironmentVariables } from '../../lib/envManager'

export function EnvironmentVariablesScreen() {
  const [envVars, setEnvVars] = useState<EnvironmentVariables>(envManager.getEnvironmentVariables())
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [configStatus, setConfigStatus] = useState<{ isConfigured: boolean; missingVars: string[] }>({ isConfigured: true, missingVars: [] })

  useEffect(() => {
    // Configuration status is now handled internally by envManager
    const envVars = envManager.getEnvironmentVariables()
    const criticalVars = ['supabaseUrl', 'supabaseAnonKey', 'adminEmail', 'adminSecretKey']
    const missingVars = criticalVars.filter(varName => !envVars[varName as keyof EnvironmentVariables] || envVars[varName as keyof EnvironmentVariables] === '')
    
    setConfigStatus({
      isConfigured: missingVars.length === 0,
      missingVars
    })
  }, [envVars])

  const handleInputChange = (key: keyof EnvironmentVariables, value: string) => {
    setEnvVars(prev => ({ ...prev, [key]: value }))
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const result = await envManager.saveEnvironmentVariables(envVars)
      if (result.success) {
        setSaveStatus('success')
        // Recalculate config status after save
        const criticalVars = ['supabaseUrl', 'supabaseAnonKey', 'adminEmail', 'adminSecretKey']
        const missingVars = criticalVars.filter(varName => !envVars[varName as keyof EnvironmentVariables] || envVars[varName as keyof EnvironmentVariables] === '')
        setConfigStatus({
          isConfigured: missingVars.length === 0,
          missingVars
        })
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleDownload = () => {
    envManager.downloadEnvFile()
  }

  const handleReset = () => {
    setEnvVars(envManager.getEnvironmentVariables())
  }

  const handleForceReload = () => {
    envManager.reload()
    const newEnvVars = envManager.getEnvironmentVariables()
    setEnvVars(newEnvVars)
    
    // Recalculate config status after reload
    const criticalVars = ['supabaseUrl', 'supabaseAnonKey', 'adminEmail', 'adminSecretKey']
    const missingVars = criticalVars.filter(varName => !newEnvVars[varName as keyof EnvironmentVariables] || newEnvVars[varName as keyof EnvironmentVariables] === '')
    setConfigStatus({
      isConfigured: missingVars.length === 0,
      missingVars
    })
  }

  const isSecretField = (key: string) => {
    return key.toLowerCase().includes('key') || 
           key.toLowerCase().includes('secret') || 
           key.toLowerCase().includes('password')
  }

  const getFieldCategory = (key: string) => {
    if (key.includes('supabase')) return 'Database'
    if (key.includes('admob')) return 'Monetization'
    if (key.includes('admin')) return 'Admin'
    if (key.includes('jwt')) return 'Security'
    if (key.includes('node') || key.includes('env')) return 'Environment'
    return 'Application'
  }

  const variableCategories = {
    database: {
      title: 'Database & Backend',
      description: 'Supabase database and authentication settings',
      icon: '🗄️',
      variables: ['supabaseUrl', 'supabaseAnonKey', 'supabaseServiceRoleKey']
    },
    admin: {
      title: 'Admin Access', 
      description: 'Admin panel login credentials',
      icon: '👤',
      variables: ['adminEmail', 'adminSecretKey']
    },
    application: {
      title: 'Application Config',
      description: 'Core app settings and API endpoints',
      icon: '⚙️',
      variables: ['appName', 'apiBaseUrl']
    },
    monetization: {
      title: 'AdMob Monetization',
      description: 'Mobile app advertising configuration',
      icon: '💰',
      variables: ['admobAppId', 'admobBannerId', 'admobInterstitialId', 'admobRewardedId']
    },
    security: {
      title: 'Security & Auth',
      description: 'JWT tokens and security keys',
      icon: '🔐',
      variables: ['jwtSecret']
    },
    environment: {
      title: 'Environment',
      description: 'Runtime environment settings',
      icon: '🌍',
      variables: ['nodeEnv']
    }
  }

  const categories = Object.keys(variableCategories)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Environment Variables
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Configure application environment variables and API keys
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleForceReload}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Reload
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download .env
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Configuration Status */}
      <Card className={`gaming-card-enhanced ${
        configStatus.isConfigured 
          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20' 
          : 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                configStatus.isConfigured 
                  ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                  : 'bg-orange-100 dark:bg-orange-900/50'
              }`}>
                {configStatus.isConfigured ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Configuration Status
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {configStatus.isConfigured 
                    ? 'All environment variables are properly configured' 
                    : `${configStatus.missingVars.length} variables need configuration`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(envVars).length - configStatus.missingVars.length} configured, {configStatus.missingVars.length} missing
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Configured</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <Card className={`gaming-card-enhanced ${
          saveStatus === 'success' 
            ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20' 
            : 'border-red-500/50 bg-red-50/50 dark:bg-red-900/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {saveStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p className="text-sm font-medium">
                {saveStatus === 'success' 
                  ? 'Environment variables saved successfully!' 
                  : 'Failed to save environment variables. Please try again.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Variables by Category */}
      {categories.map(categoryKey => {
        const category = variableCategories[categoryKey as keyof typeof variableCategories]
        const categoryVars = Object.entries(envVars).filter(([key]) => 
          category.variables.includes(key)
        )
        
        if (categoryVars.length === 0) return null

        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </div>
                <Badge variant="default" className="text-xs">
                  {categoryVars.length} variables
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryVars.map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {key}
                      {!value || value.startsWith('your_') || value.startsWith('your-') ? (
                        <Badge variant="warning" className="ml-2 text-xs">Required</Badge>
                      ) : (
                        <Badge variant="success" className="ml-2 text-xs">Configured</Badge>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type={isSecretField(key) && !showSecrets[key] ? "password" : "text"}
                        value={value}
                        onChange={(e) => handleInputChange(key as keyof EnvironmentVariables, e.target.value)}
                        placeholder={`Enter ${key.toLowerCase().replace(/_/g, ' ')}`}
                        className={`pr-10 ${
                          !value || value.startsWith('your_') || value.startsWith('your-')
                            ? 'border-orange-300 dark:border-orange-600' 
                            : 'border-emerald-300 dark:border-emerald-600'
                        }`}
                      />
                      {isSecretField(key) && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(key)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showSecrets[key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
