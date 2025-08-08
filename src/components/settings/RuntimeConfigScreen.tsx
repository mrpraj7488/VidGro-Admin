import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Shield,
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle,
  History,
  Copy,
  Key,
  Zap,
  Database,
  Smartphone
} from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { RuntimeConfig } from '../../types/admin'
import { format } from 'date-fns'

export function RuntimeConfigScreen() {
  const { 
    runtimeConfig, 
    configAuditLogs, 
    clientConfig,
    selectedEnvironment,
    isLoading, 
    fetchRuntimeConfig, 
    fetchConfigAuditLogs,
    fetchClientConfig,
    saveRuntimeConfig,
    deleteRuntimeConfigItem,
    clearConfigCache,
    setSelectedEnvironment,
    copyToClipboard
  } = useAdminStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [isKeyRotationModalOpen, setIsKeyRotationModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<RuntimeConfig | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    isPublic: false,
    description: '',
    category: 'general',
    reason: ''
  })

  const [keyRotationData, setKeyRotationData] = useState({
    selectedKeys: [] as string[],
    rotationType: 'manual' as 'manual' | 'scheduled',
    scheduleDate: '',
    notifyUsers: true,
    reason: ''
  })

  const [importData, setImportData] = useState({
    jsonContent: '',
    overwriteExisting: false,
    targetEnvironment: selectedEnvironment
  })
  useEffect(() => {
    fetchRuntimeConfig(selectedEnvironment)
    fetchClientConfig(selectedEnvironment)
    setLastSyncTime(new Date())
  }, [selectedEnvironment, fetchRuntimeConfig, fetchClientConfig])

  const environments = ['production', 'staging', 'development']
  const categories = ['general', 'supabase', 'admob', 'firebase', 'features', 'app', 'security']

  // Enhanced filtering with security considerations
  const filteredConfig = runtimeConfig.filter(config => {
    const matchesSearch = config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || config.category === categoryFilter
    const matchesVisibility = visibilityFilter === 'all' || 
                             (visibilityFilter === 'public' && config.isPublic) ||
                             (visibilityFilter === 'private' && !config.isPublic)
    
    return matchesSearch && matchesCategory && matchesVisibility
  })

  // Security metrics
  const securityMetrics = {
    totalConfigs: runtimeConfig.length,
    publicConfigs: runtimeConfig.filter(c => c.isPublic).length,
    privateConfigs: runtimeConfig.filter(c => !c.isPublic).length,
    secretKeys: runtimeConfig.filter(c => isSecretField(c.key)).length,
    lastRotation: '30 days ago', // This would come from audit logs
    vulnerableKeys: runtimeConfig.filter(c => 
      isSecretField(c.key) && 
      new Date(c.updatedAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length
  }
  const handleCreateConfig = () => {
    setFormData({
      key: '',
      value: '',
      isPublic: false,
      description: '',
      category: 'general',
      reason: ''
    })
    setIsCreateModalOpen(true)
  }

  const handleEditConfig = (config: RuntimeConfig) => {
    setSelectedConfig(config)
    setFormData({
      key: config.key,
      value: config.value,
      isPublic: config.isPublic,
      description: config.description || '',
      category: config.category,
      reason: ''
    })
    setIsEditModalOpen(true)
  }

  const handleSaveConfig = async () => {
    try {
      await saveRuntimeConfig(
        formData.key,
        formData.value,
        formData.isPublic,
        selectedEnvironment,
        formData.description,
        formData.category,
        formData.reason
      )
      setIsCreateModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedConfig(null)
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  const handleDeleteConfig = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the configuration "${key}"?`)) return
    
    try {
      const reason = prompt('Please provide a reason for deletion:')
      if (reason === null) return // User cancelled
      
      await deleteRuntimeConfigItem(key, selectedEnvironment, reason)
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Failed to delete config:', error)
    }
  }

  const handleViewAuditLogs = (configKey?: string) => {
    fetchConfigAuditLogs(configKey, selectedEnvironment)
    setIsAuditModalOpen(true)
  }

  const handleKeyRotation = async () => {
    try {
      // Mock implementation - in real app, this would rotate selected keys
      console.log('Rotating keys:', keyRotationData)
      
      // Simulate key rotation process
      for (const key of keyRotationData.selectedKeys) {
        const config = runtimeConfig.find(c => c.key === key)
        if (config && isSecretField(key)) {
          const newValue = generateNewKey(key)
          await saveRuntimeConfig(
            key,
            newValue,
            config.isPublic,
            selectedEnvironment,
            config.description,
            config.category,
            `Key rotation: ${keyRotationData.reason}`
          )
        }
      }
      
      setIsKeyRotationModalOpen(false)
      setKeyRotationData({
        selectedKeys: [],
        rotationType: 'manual',
        scheduleDate: '',
        notifyUsers: true,
        reason: ''
      })
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Failed to rotate keys:', error)
    }
  }

  const handleImportConfig = async () => {
    try {
      const configData = JSON.parse(importData.jsonContent)
      
      for (const [key, value] of Object.entries(configData)) {
        if (typeof value === 'string') {
          await saveRuntimeConfig(
            key,
            value,
            false, // Default to private for imported configs
            importData.targetEnvironment,
            `Imported configuration`,
            'general',
            'Bulk import from JSON'
          )
        }
      }
      
      setIsImportModalOpen(false)
      setImportData({
        jsonContent: '',
        overwriteExisting: false,
        targetEnvironment: selectedEnvironment
      })
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Failed to import config:', error)
      alert('Invalid JSON format or import failed')
    }
  }

  const generateNewKey = (keyType: string): string => {
    // Mock key generation - in real app, this would generate proper keys
    const timestamp = Date.now()
    if (keyType.includes('JWT')) {
      return `jwt_secret_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    }
    if (keyType.includes('API')) {
      return `api_key_${timestamp}_${Math.random().toString(36).substr(2, 16)}`
    }
    return `key_${timestamp}_${Math.random().toString(36).substr(2, 12)}`
  }

  const exportConfig = () => {
    const exportData = {
      environment: selectedEnvironment,
      timestamp: new Date().toISOString(),
      configs: filteredConfig.reduce((acc, config) => {
        acc[config.key] = {
          value: config.value,
          isPublic: config.isPublic,
          category: config.category,
          description: config.description
        }
        return acc
      }, {} as Record<string, any>)
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `runtime-config-${selectedEnvironment}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isSecretField = (key: string) => {
    return key.toLowerCase().includes('key') || 
           key.toLowerCase().includes('secret') || 
           key.toLowerCase().includes('password')
  }

  const getVisibilityIcon = (isPublic: boolean) => {
    return isPublic ? (
      <Globe className="w-4 h-4 text-emerald-500" />
    ) : (
      <Lock className="w-4 h-4 text-orange-500" />
    )
  }

  const getVisibilityBadge = (isPublic: boolean) => {
    return isPublic ? (
      <Badge variant="success" className="text-xs">Public</Badge>
    ) : (
      <Badge variant="warning" className="text-xs">Private</Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Runtime Configuration
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage dynamic configuration for mobile clients and backend services
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Database className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={exportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setIsKeyRotationModalOpen(true)}>
            <Key className="w-4 h-4 mr-2" />
            Rotate Keys
          </Button>
          <Button variant="outline" onClick={() => handleViewAuditLogs()}>
            <History className="w-4 h-4 mr-2" />
            Audit Logs
          </Button>
          <Button variant="outline" onClick={clearConfigCache}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={handleCreateConfig}>
            <Plus className="w-4 h-4 mr-2" />
            Add Config
          </Button>
        </div>
      </div>

      {/* Security Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gaming-card-enhanced border-violet-500/50 bg-violet-50/50 dark:bg-violet-900/20">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {securityMetrics.totalConfigs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Configs</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {securityMetrics.publicConfigs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Public Keys</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {securityMetrics.privateConfigs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Private Keys</div>
          </CardContent>
        </Card>

        <Card className={`gaming-card-enhanced ${
          securityMetrics.vulnerableKeys > 0 
            ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/20' 
            : 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20'
        }`}>
          <CardContent className="p-4 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
              securityMetrics.vulnerableKeys > 0 ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className={`text-2xl font-bold ${
              securityMetrics.vulnerableKeys > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              {securityMetrics.vulnerableKeys}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {securityMetrics.vulnerableKeys > 0 ? 'Keys Need Rotation' : 'Security Status'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {securityMetrics.vulnerableKeys > 0 && (
        <Card className="gaming-card-enhanced border-red-500/50 bg-red-50/50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Security Alert</h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {securityMetrics.vulnerableKeys} API keys haven't been rotated in over 90 days. 
                  Consider rotating them for enhanced security.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsKeyRotationModalOpen(true)}
                className="ml-auto"
              >
                <Key className="w-4 h-4 mr-2" />
                Rotate Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Environment Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Environment</h3>
              <div className="flex space-x-2">
                {environments.map(env => (
                  <button
                    key={env}
                    onClick={() => setSelectedEnvironment(env)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedEnvironment === env
                        ? 'bg-violet-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredConfig.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Configs</div>
              {lastSyncTime && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Last sync: {format(lastSyncTime, 'HH:mm:ss')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Config Preview */}
      {clientConfig && (
        <Card className="gaming-card-enhanced border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300">
              <Smartphone className="w-5 h-5" />
              <span>Mobile Client Configuration</span>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="text-xs">
                  {Object.keys(clientConfig.config).length} public keys
                </Badge>
                <Badge variant="info" className="text-xs">
                  {selectedEnvironment}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-emerald-700 dark:text-emerald-300">
                <Zap className="w-4 h-4" />
                <span>This configuration is delivered to mobile clients via the secure API endpoint</span>
              </div>
            </div>
            <div className="bg-emerald-900/10 dark:bg-emerald-900/30 rounded-lg p-4 font-mono text-sm">
              <pre className="text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap">
                {JSON.stringify(clientConfig.config, null, 2)}
              </pre>
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-emerald-600 dark:text-emerald-400">
              <span>Last updated: {format(new Date(clientConfig.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${window.location.origin}/api/client-runtime-config?env=${selectedEnvironment}`)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy API URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(clientConfig.config, null, 2))}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search configurations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => fetchRuntimeConfig(selectedEnvironment)}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr>
                  <th className="text-left">Key</th>
                  <th className="text-left">Value</th>
                  <th className="text-left">Visibility</th>
                  <th className="text-left">Category</th>
                  <th className="text-left">Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConfig.map((config) => (
                  <tr key={config.id} className="group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <code className="bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded text-sm font-mono text-violet-600 dark:text-violet-400">
                          {config.key}
                        </code>
                        {isSecretField(config.key) && (
                          <Badge variant="warning" className="text-xs">
                            <Key className="w-3 h-3 mr-1" />
                            Secret
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(config.key)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      {config.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {isSecretField(config.key) && !showSecrets[config.key] ? (
                          <span className="font-mono text-sm text-gray-400">••••••••</span>
                        ) : (
                          <span className="font-mono text-sm text-gray-900 dark:text-white max-w-xs truncate">
                            {config.value}
                          </span>
                        )}
                        {isSecretField(config.key) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(config.key)}
                          >
                            {showSecrets[config.key] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getVisibilityIcon(config.isPublic)}
                        {getVisibilityBadge(config.isPublic)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="default" className="text-xs capitalize">
                        {config.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(config.updatedAt), 'MMM dd, HH:mm')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAuditLogs(config.key)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConfig(config)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConfig(config.key)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Rotation Modal */}
      {isKeyRotationModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gaming-modal max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>API Key Rotation</span>
                </h3>
                <p className="text-sm text-gray-400">Rotate API keys and secrets for enhanced security</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsKeyRotationModalOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Keys to Rotate
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto gaming-scrollbar">
                  {runtimeConfig.filter(c => isSecretField(c.key)).map(config => (
                    <div key={config.key} className="flex items-center space-x-3 p-3 gaming-card">
                      <input
                        type="checkbox"
                        checked={keyRotationData.selectedKeys.includes(config.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setKeyRotationData(prev => ({
                              ...prev,
                              selectedKeys: [...prev.selectedKeys, config.key]
                            }))
                          } else {
                            setKeyRotationData(prev => ({
                              ...prev,
                              selectedKeys: prev.selectedKeys.filter(k => k !== config.key)
                            }))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <code className="text-sm font-mono text-violet-400">{config.key}</code>
                        <p className="text-xs text-gray-400">{config.description}</p>
                      </div>
                      <Badge variant={
                        new Date(config.updatedAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                          ? 'danger' : 'success'
                      } className="text-xs">
                        {new Date(config.updatedAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                          ? 'Needs Rotation' : 'Recent'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rotation Reason
                </label>
                <Input
                  value={keyRotationData.reason}
                  onChange={(e) => setKeyRotationData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Security maintenance, suspected compromise, etc."
                  className="!bg-violet-500/10"
                />
              </div>

              <div className="flex items-center justify-between p-4 gaming-card">
                <div>
                  <h4 className="font-medium text-white">Notify Mobile Clients</h4>
                  <p className="text-sm text-gray-400">Send push notification about config update</p>
                </div>
                <input
                  type="checkbox"
                  checked={keyRotationData.notifyUsers}
                  onChange={(e) => setKeyRotationData(prev => ({ ...prev, notifyUsers: e.target.checked }))}
                  className="rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-violet-500/20">
                <Button variant="outline" onClick={() => setIsKeyRotationModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleKeyRotation}
                  disabled={keyRotationData.selectedKeys.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Rotate {keyRotationData.selectedKeys.length} Keys</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Configuration Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gaming-modal max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Import Configuration</span>
                </h3>
                <p className="text-sm text-gray-400">Import configuration from JSON file</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsImportModalOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Environment
                </label>
                <select
                  value={importData.targetEnvironment}
                  onChange={(e) => setImportData(prev => ({ ...prev, targetEnvironment: e.target.value }))}
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white"
                >
                  {environments.map(env => (
                    <option key={env} value={env}>{env.charAt(0).toUpperCase() + env.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  JSON Configuration
                </label>
                <textarea
                  value={importData.jsonContent}
                  onChange={(e) => setImportData(prev => ({ ...prev, jsonContent: e.target.value }))}
                  placeholder='{"FEATURE_ADS_ENABLED": "true", "ADMOB_APP_ID": "ca-app-pub-xxx"}'
                  rows={8}
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white placeholder-gray-400 font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between p-4 gaming-card">
                <div>
                  <h4 className="font-medium text-white">Overwrite Existing</h4>
                  <p className="text-sm text-gray-400">Replace existing configurations with imported values</p>
                </div>
                <input
                  type="checkbox"
                  checked={importData.overwriteExisting}
                  onChange={(e) => setImportData(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                  className="rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-violet-500/20">
                <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImportConfig}
                  disabled={!importData.jsonContent.trim()}
                  className="flex items-center space-x-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Import Configuration</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gaming-modal max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isCreateModalOpen ? 'Create Configuration' : 'Edit Configuration'}
                </h3>
                <p className="text-sm text-gray-400">
                  {isCreateModalOpen ? 'Add new runtime configuration' : 'Modify existing configuration'}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  setSelectedConfig(null)
                }}
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Configuration Key *
                  </label>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                    placeholder="FEATURE_ADS_ENABLED"
                    disabled={isEditModalOpen}
                    className="!bg-violet-500/10 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Value *
                </label>
                <textarea
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Configuration value..."
                  rows={3}
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white placeholder-gray-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this configuration"
                  className="!bg-violet-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Change
                </label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Why are you making this change?"
                  className="!bg-violet-500/10"
                />
              </div>

              <div className="flex items-center justify-between p-4 gaming-card">
                <div>
                  <h4 className="font-medium text-white flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Client Visibility</span>
                  </h4>
                  <p className="text-sm text-gray-400">
                    {formData.isPublic 
                      ? 'This configuration will be available to mobile clients' 
                      : 'This configuration is backend-only and secure'
                    }
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                      formData.isPublic
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-violet-500/20">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setIsEditModalOpen(false)
                    setSelectedConfig(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveConfig}
                  disabled={!formData.key || !formData.value}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isCreateModalOpen ? 'Create' : 'Update'} Configuration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gaming-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
              <div>
                <h3 className="text-xl font-bold text-white">Configuration Audit Logs</h3>
                <p className="text-sm text-gray-400">Track all configuration changes</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAuditModalOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {configAuditLogs.map((log) => (
                  <div key={log.id} className="gaming-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge 
                            variant={
                              log.action === 'create' ? 'success' :
                              log.action === 'update' ? 'warning' : 'danger'
                            }
                            className="text-xs"
                          >
                            {log.action.toUpperCase()}
                          </Badge>
                          <code className="text-sm font-mono text-violet-400">{log.configKey}</code>
                        </div>
                        
                        <div className="text-sm text-gray-300 space-y-1">
                          {log.oldValue && (
                            <div>
                              <span className="text-red-400">- </span>
                              <span className="font-mono">{log.oldValue}</span>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <span className="text-green-400">+ </span>
                              <span className="font-mono">{log.newValue}</span>
                            </div>
                          )}
                        </div>
                        
                        {log.reason && (
                          <p className="text-sm text-gray-400 mt-2">
                            <strong>Reason:</strong> {log.reason}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-gray-400">
                        <p>{log.adminEmail}</p>
                        <p>{format(new Date(log.timestamp), 'MMM dd, HH:mm')}</p>
                        {log.ipAddress && (
                          <p className="font-mono text-xs">{log.ipAddress}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}