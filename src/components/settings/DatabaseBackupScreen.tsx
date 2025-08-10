import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Download, 
  Upload, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  HardDrive, 
  Clock,
  Settings,
  Play,
  Pause,
  Trash2,
  FileText,
  Shield,
  Zap,
  Server,
  Archive,
  CloudDownload,
  Timer,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { format, formatDistanceToNow } from 'date-fns'

interface DatabaseBackup {
  id: string
  name: string
  type: 'full' | 'users' | 'videos' | 'config' | 'analytics'
  size: string
  date: Date
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled'
  duration: number // in seconds
  tables: string[]
  compression: 'none' | 'gzip' | 'bzip2'
  encryption: boolean
  downloadUrl?: string
  checksum?: string
}

interface BackupSettings {
  autoBackupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupTime: string
  retentionDays: number
  compression: 'none' | 'gzip' | 'bzip2'
  encryption: boolean
  includeBlobs: boolean
  maxBackupSize: number // in GB
  notifyOnCompletion: boolean
  notifyOnFailure: boolean
}

export function DatabaseBackupScreen() {
  const [backups, setBackups] = useState<DatabaseBackup[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [selectedBackupType, setSelectedBackupType] = useState<string>('full')
  const [backupProgress, setBackupProgress] = useState(0)
  const [currentBackupId, setCurrentBackupId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [storageUsage, setStorageUsage] = useState({
    used: 2.4,
    total: 10.0,
    backupCount: 15
  })

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    compression: 'gzip',
    encryption: true,
    includeBlobs: false,
    maxBackupSize: 5,
    notifyOnCompletion: true,
    notifyOnFailure: true
  })

  // Mock backup data
  useEffect(() => {
    const mockBackups: DatabaseBackup[] = [
      {
        id: 'backup-1',
        name: 'Full System Backup - Auto',
        type: 'full',
        size: '2.4 GB',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed',
        duration: 1847,
        tables: ['profiles', 'videos', 'video_deletions', 'admin_profiles', 'admin_logs', 'runtime_config'],
        compression: 'gzip',
        encryption: true,
        checksum: 'sha256:abc123def456...'
      },
      {
        id: 'backup-2',
        name: 'User Data Backup',
        type: 'users',
        size: '856 MB',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'completed',
        duration: 623,
        tables: ['profiles', 'admin_profiles'],
        compression: 'gzip',
        encryption: true
      },
      {
        id: 'backup-3',
        name: 'Video Data Backup',
        type: 'videos',
        size: '1.2 GB',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        duration: 1234,
        tables: ['videos', 'video_deletions'],
        compression: 'gzip',
        encryption: false
      },
      {
        id: 'backup-4',
        name: 'Configuration Backup',
        type: 'config',
        size: '12 MB',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        duration: 45,
        tables: ['runtime_config', 'config_audit_log'],
        compression: 'none',
        encryption: true
      },
      {
        id: 'backup-5',
        name: 'Scheduled Full Backup',
        type: 'full',
        size: '0 MB',
        date: new Date(Date.now() + 6 * 60 * 60 * 1000),
        status: 'scheduled',
        duration: 0,
        tables: ['profiles', 'videos', 'video_deletions', 'admin_profiles', 'admin_logs', 'runtime_config'],
        compression: 'gzip',
        encryption: true
      }
    ]
    setBackups(mockBackups)
  }, [])

  const handleCreateBackup = async (type: string, customName?: string) => {
    setIsCreatingBackup(true)
    setSelectedBackupType(type)
    setBackupProgress(0)
    
    const backupId = `backup-${Date.now()}`
    setCurrentBackupId(backupId)
    
    // Create new backup entry
    const newBackup: DatabaseBackup = {
      id: backupId,
      name: customName || `${type.charAt(0).toUpperCase() + type.slice(1)} Backup - ${format(new Date(), 'MMM dd, HH:mm')}`,
      type: type as any,
      size: '0 MB',
      date: new Date(),
      status: 'in_progress',
      duration: 0,
      tables: getTablesForType(type),
      compression: backupSettings.compression,
      encryption: backupSettings.encryption
    }
    
    setBackups(prev => [newBackup, ...prev])
    
    // Simulate backup progress
    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          // Update backup status to completed
          setBackups(prevBackups => prevBackups.map(backup => 
            backup.id === backupId 
              ? { 
                  ...backup, 
                  status: 'completed', 
                  size: getEstimatedSize(type),
                  duration: Math.floor(Math.random() * 1800) + 300 // 5-35 minutes
                }
              : backup
          ))
          setIsCreatingBackup(false)
          setCurrentBackupId(null)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 500)
  }

  const getTablesForType = (type: string): string[] => {
    switch (type) {
      case 'full':
        return ['profiles', 'videos', 'video_deletions', 'admin_profiles', 'admin_logs', 'runtime_config', 'config_audit_log']
      case 'users':
        return ['profiles', 'admin_profiles']
      case 'videos':
        return ['videos', 'video_deletions']
      case 'config':
        return ['runtime_config', 'config_audit_log']
      case 'analytics':
        return ['admin_logs', 'config_audit_log']
      default:
        return []
    }
  }

  const getEstimatedSize = (type: string): string => {
    const sizes = {
      full: '2.4 GB',
      users: '856 MB',
      videos: '1.2 GB',
      config: '12 MB',
      analytics: '245 MB'
    }
    return sizes[type] || '100 MB'
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return
    }
    
    setIsRestoring(true)
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsRestoring(false)
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return
    }
    
    setBackups(prev => prev.filter(backup => backup.id !== backupId))
  }

  const handleDownloadBackup = (backup: DatabaseBackup) => {
    // Simulate download
    console.log('Downloading backup:', backup.name)
  }

  const handleSaveSettings = async () => {
    // TODO: Save backup settings to database
    console.log('Saving backup settings:', backupSettings)
  }

  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Database className="w-5 h-5" />
      case 'users': return <Database className="w-5 h-5" />
      case 'videos': return <Database className="w-5 h-5" />
      case 'config': return <Settings className="w-5 h-5" />
      case 'analytics': return <FileText className="w-5 h-5" />
      default: return <Database className="w-5 h-5" />
    }
  }

  const getBackupTypeBadge = (type: string) => {
    switch (type) {
      case 'full': return <Badge variant="info" className="text-xs">Full System</Badge>
      case 'users': return <Badge variant="success" className="text-xs">User Data</Badge>
      case 'videos': return <Badge variant="warning" className="text-xs">Video Data</Badge>
      case 'config': return <Badge variant="default" className="text-xs">Configuration</Badge>
      case 'analytics': return <Badge variant="info" className="text-xs">Analytics</Badge>
      default: return <Badge variant="default" className="text-xs">{type}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-orange-500" />
      default:
        return <Database className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-xs">Completed</Badge>
      case 'in_progress':
        return <Badge variant="info" className="text-xs">In Progress</Badge>
      case 'failed':
        return <Badge variant="danger" className="text-xs">Failed</Badge>
      case 'scheduled':
        return <Badge variant="warning" className="text-xs">Scheduled</Badge>
      default:
        return <Badge variant="default" className="text-xs">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Database Backup & Restore
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Manage Supabase database backups and restoration
          </p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto">
          <Button 
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="flex-1 sm:flex-none text-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button 
            onClick={() => handleCreateBackup('full')}
            disabled={isCreatingBackup}
            className="flex-1 sm:flex-none text-sm"
          >
            {isCreatingBackup ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Creating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Full Backup</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <HardDrive className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-violet-600 dark:text-violet-400">
              {storageUsage.used} GB
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-violet-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(storageUsage.used / storageUsage.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Archive className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {storageUsage.backupCount}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Backups</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Timer className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {backupSettings.autoBackupEnabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Auto Backup</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {backupSettings.retentionDays}d
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Retention</div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { 
            type: 'full', 
            label: 'Full System', 
            description: 'Complete database backup',
            icon: Database,
            color: 'violet',
            estimatedSize: '2.4 GB',
            estimatedTime: '30 min'
          },
          { 
            type: 'users', 
            label: 'User Data', 
            description: 'Profiles and user info',
            icon: Database,
            color: 'emerald',
            estimatedSize: '856 MB',
            estimatedTime: '10 min'
          },
          { 
            type: 'videos', 
            label: 'Video Data', 
            description: 'Video metadata and stats',
            icon: Database,
            color: 'orange',
            estimatedSize: '1.2 GB',
            estimatedTime: '20 min'
          },
          { 
            type: 'config', 
            label: 'Configuration', 
            description: 'Runtime config and settings',
            icon: Settings,
            color: 'blue',
            estimatedSize: '12 MB',
            estimatedTime: '1 min'
          },
          { 
            type: 'analytics', 
            label: 'Analytics', 
            description: 'Logs and audit trails',
            icon: FileText,
            color: 'purple',
            estimatedSize: '245 MB',
            estimatedTime: '5 min'
          }
        ].map((backupType) => {
          const Icon = backupType.icon
          const isActive = selectedBackupType === backupType.type && isCreatingBackup
          
          return (
            <Card key={backupType.type} className="gaming-card-enhanced group">
              <CardContent className="p-4 md:p-6 text-center">
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${
                  backupType.color === 'violet' ? 'from-violet-500 to-purple-600' :
                  backupType.color === 'emerald' ? 'from-emerald-500 to-green-600' :
                  backupType.color === 'orange' ? 'from-orange-500 to-amber-600' :
                  backupType.color === 'blue' ? 'from-blue-500 to-cyan-600' :
                  'from-purple-500 to-pink-600'
                } rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 gaming-glow transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white mb-1 md:mb-2">
                  {backupType.label}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3 leading-relaxed">
                  {backupType.description}
                </p>
                <div className="space-y-1 text-xs text-gray-400 dark:text-gray-500 mb-3 md:mb-4">
                  <div>~{backupType.estimatedSize}</div>
                  <div>~{backupType.estimatedTime}</div>
                </div>
                
                {isActive ? (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-violet-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${backupProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                      {Math.round(backupProgress)}%
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleCreateBackup(backupType.type)}
                    disabled={isCreatingBackup}
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Create
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Backup Settings Panel */}
      {showSettings && (
        <Card className="gaming-card-enhanced border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Settings className="w-5 h-5" />
              <span>Backup Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Auto Backup Toggle */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Automatic Backup</h4>
                <div className="flex items-center justify-between p-3 md:p-4 gaming-card">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Auto Backup</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily automated backups</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBackupSettings(prev => ({ ...prev, autoBackupEnabled: !prev.autoBackupEnabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                      backupSettings.autoBackupEnabled
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                        : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        backupSettings.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Backup Frequency */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Frequency</h4>
                <select
                  value={backupSettings.backupFrequency}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, backupFrequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-gray-900 dark:text-white text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Backup Time */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Backup Time</h4>
                <Input
                  type="time"
                  value={backupSettings.backupTime}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, backupTime: e.target.value }))}
                  className="text-sm"
                />
              </div>

              {/* Retention Days */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Retention (Days)</h4>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={backupSettings.retentionDays}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: Number(e.target.value) }))}
                  className="text-sm"
                />
              </div>

              {/* Compression */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Compression</h4>
                <select
                  value={backupSettings.compression}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, compression: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-gray-900 dark:text-white text-sm"
                >
                  <option value="none">None</option>
                  <option value="gzip">GZIP</option>
                  <option value="bzip2">BZIP2</option>
                </select>
              </div>

              {/* Encryption */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Security</h4>
                <div className="flex items-center justify-between p-3 gaming-card">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Encryption</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AES-256 encryption</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBackupSettings(prev => ({ ...prev, encryption: !prev.encryption }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
                      backupSettings.encryption
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                        : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        backupSettings.encryption ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-violet-500/20">
              <Button onClick={handleSaveSettings} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Backup Progress */}
      {isCreatingBackup && currentBackupId && (
        <Card className="gaming-card-enhanced border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center gaming-pulse">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                  Creating {selectedBackupType.charAt(0).toUpperCase() + selectedBackupType.slice(1)} Backup
                </h3>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 mt-2">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${backupProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-blue-700 dark:text-blue-300 mt-1">
                  <span>Progress: {Math.round(backupProgress)}%</span>
                  <span>ETA: {Math.max(0, Math.round((100 - backupProgress) / 10))} min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="w-5 h-5" />
            <span>Backup History</span>
            <Badge variant="default" className="text-xs">
              {backups.length} backups
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 md:space-y-4 p-4 md:p-6">
            {backups.map((backup) => (
              <div key={backup.id} className="gaming-card hover:scale-[1.01] transition-all duration-300 p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Backup Info */}
                  <div className="flex items-start space-x-3 md:space-x-4 flex-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getBackupTypeIcon(backup.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">
                          {backup.name}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {getBackupTypeBadge(backup.type)}
                          {getStatusBadge(backup.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{backup.size}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="truncate">{format(backup.date, 'MMM dd, HH:mm')}</span>
                        </div>
                        {backup.duration > 0 && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{Math.floor(backup.duration / 60)}m {backup.duration % 60}s</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{backup.tables.length} tables</span>
                        </div>
                      </div>

                      {/* Security Features */}
                      <div className="flex items-center space-x-2 mt-2">
                        {backup.compression !== 'none' && (
                          <Badge variant="default" className="text-xs">
                            <Archive className="w-3 h-3 mr-1" />
                            {backup.compression.toUpperCase()}
                          </Badge>
                        )}
                        {backup.encryption && (
                          <Badge variant="success" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Encrypted
                          </Badge>
                        )}
                        {backup.checksum && (
                          <Badge variant="info" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {backup.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup)}
                          className="text-xs"
                        >
                          <CloudDownload className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={isRestoring}
                          className="text-xs"
                        >
                          {isRestoring ? (
                            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">Restore</span>
                        </Button>
                      </>
                    )}
                    {backup.status !== 'in_progress' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tables List (Expandable on Mobile) */}
                <details className="mt-4 lg:hidden">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    View Tables ({backup.tables.length})
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {backup.tables.map((table) => (
                      <Badge key={table} variant="default" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="w-5 h-5" />
            <span>Backup Schedule</span>
            {backupSettings.autoBackupEnabled ? (
              <Badge variant="success" className="text-xs gaming-pulse">Active</Badge>
            ) : (
              <Badge variant="default" className="text-xs">Disabled</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupSettings.autoBackupEnabled ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="font-medium text-emerald-800 dark:text-emerald-300">
                      Automatic Backup Scheduled
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      {backupSettings.backupFrequency.charAt(0).toUpperCase() + backupSettings.backupFrequency.slice(1)} backups at {backupSettings.backupTime}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <h4 className="font-medium text-orange-800 dark:text-orange-300">
                      Automatic Backup Disabled
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      Enable automatic backups to protect your data
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Scheduled Backup */}
            {backupSettings.autoBackupEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="gaming-card p-4 text-center">
                  <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    Tomorrow
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Next Full Backup</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    at {backupSettings.backupTime}
                  </div>
                </div>
                
                <div className="gaming-card p-4 text-center">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {backupSettings.retentionDays}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Retention</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Auto cleanup
                  </div>
                </div>
                
                <div className="gaming-card p-4 text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {backupSettings.compression.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compression</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {backupSettings.encryption ? 'Encrypted' : 'No encryption'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Mobile */}
      <div className="lg:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleCreateBackup('users')}
                disabled={isCreatingBackup}
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <Database className="w-6 h-6" />
                <span className="text-xs">Backup Users</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateBackup('videos')}
                disabled={isCreatingBackup}
                className="flex flex-col items-center space-y-2 h-auto py-4"
              >
                <Database className="w-6 h-6" />
                <span className="text-xs">Backup Videos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}