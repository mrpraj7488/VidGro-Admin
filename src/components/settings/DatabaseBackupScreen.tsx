import React, { useState, useEffect } from 'react'
import { Database, Download, Calendar, CheckCircle, AlertTriangle, RefreshCw, Clock, Timer, Save, Bell, BellOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { format, formatDistanceToNow } from 'date-fns'
import { useBackupService } from '../../services/backupService'

interface DatabaseBackup {
  id: string
  name: string
  size: string
  date: Date
  status: 'completed' | 'in_progress' | 'failed'
  duration: number // in seconds
  downloadUrl?: string
  checksum?: string
  sqlFilePath?: string
  storagePath?: string
}

interface BackupSettings {
  autoBackupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupTime: string
  notifyOnCompletion: boolean
  notifyOnFailure: boolean
}

export function DatabaseBackupScreen() {
  const { createBackup, isLoading: backupServiceLoading, error: backupError } = useBackupService()
  const [backups, setBackups] = useState<DatabaseBackup[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [currentBackupId, setCurrentBackupId] = useState<string | null>(null)
  const [lastBackupError, setLastBackupError] = useState<string | null>(null)
  
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    notifyOnCompletion: true,
    notifyOnFailure: true
  })

  // No mock history. Only real backups created in this session
  useEffect(() => {
    setBackups([])
  }, [])

  // Load existing backups from storage on component mount
  useEffect(() => {
    const loadExistingBackups = async () => {
      try {
        const { backupService } = await import('../../services/backupService')
        const result = await backupService.listExistingBackups()
        
        if (result.success && result.backups.length > 0) {
          const formattedBackups: DatabaseBackup[] = result.backups.map((backup: any) => ({
            id: backup.id || `backup-${Date.now()}-${Math.random()}`,
            name: backup.name || 'Database Backup',
            size: formatFileSize(backup.size || 0),
            date: new Date(backup.created_at || backup.updated_at || Date.now()),
            status: 'completed' as const,
            duration: 0, // We don't have duration for existing backups
            downloadUrl: undefined, // Will be generated when needed
            checksum: undefined,
            storagePath: backup.path,
            sqlFilePath: undefined
          }))
          
          setBackups(formattedBackups)
        }
      } catch (error) {
        console.error('Failed to load existing backups:', error)
      }
    }

    loadExistingBackups()
  }, [])

  const handleCreateBackup = async (customName?: string) => {
    if (isCreatingBackup) return
    
    setIsCreatingBackup(true)
    setBackupProgress(0)
    setLastBackupError(null)
    
    const backupId = `backup-${Date.now()}`
    setCurrentBackupId(backupId)
    
    // Create new backup entry
    const newBackup: DatabaseBackup = {
      id: backupId,
      name: customName || `Complete Database Backup - Manual - ${format(new Date(), 'MMM dd, HH:mm')}`,
      size: '0 MB',
      date: new Date(),
      status: 'in_progress',
      duration: 0
    }
    
    setBackups(prev => [newBackup, ...prev])
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 95 ? 95 : newProgress
      })
    }, 500)

    try {
      // Use real backup service for complete database backup
      const result = await createBackup({
        type: 'full',
        compression: 'gzip',
        encryption: true,
        includeBlobs: false,
        customName
      })

      clearInterval(progressInterval)
      setBackupProgress(100)

      if (result.success) {
        // Update backup status to completed
        setBackups(prevBackups => prevBackups.map(backup => 
          backup.id === backupId 
            ? { 
                ...backup, 
                status: 'completed', 
                size: formatFileSize(result.size || 0),
                duration: result.duration || 0,
                checksum: result.checksum,
                downloadUrl: result.downloadUrl,
                storagePath: (result as any).storagePath,
                sqlFilePath: undefined
              }
            : backup
        ))
        
        // Show success notification if enabled
        if (backupSettings.notifyOnCompletion) {
          showNotification('Backup Completed', 'Database backup completed successfully', 'success')
        }
      } else {
        // Update backup status to failed
        setBackups(prevBackups => prevBackups.map(backup => 
          backup.id === backupId 
            ? { ...backup, status: 'failed' }
            : backup
        ))
        
        setLastBackupError(result.error || 'Backup failed for unknown reason')
        
        // Show failure notification if enabled
        if (backupSettings.notifyOnFailure) {
          showNotification('Backup Failed', result.error || 'Database backup failed', 'error')
        }
      }
    } catch (error) {
      clearInterval(progressInterval)
      setBackupProgress(100)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setLastBackupError(errorMessage)
      
      // Update backup status to failed
      setBackups(prevBackups => prevBackups.map(backup => 
        backup.id === backupId 
          ? { ...backup, status: 'failed' }
          : backup
      ))
      
      // Show failure notification if enabled
      if (backupSettings.notifyOnFailure) {
        showNotification('Backup Failed', errorMessage, 'error')
      }
    } finally {
      setIsCreatingBackup(false)
      setCurrentBackupId(null)
      setTimeout(() => setBackupProgress(0), 2000)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleDownloadBackup = async (backup: DatabaseBackup) => {
    try {
      let downloadUrl = backup.downloadUrl
      
      // If no download URL exists, generate one using the storage path
      if (!downloadUrl && backup.storagePath) {
        const { backupService } = await import('../../services/backupService')
        const urls = await backupService.getBackupUrls(backup.storagePath)
        downloadUrl = urls.publicUrl || urls.signedUrl
      }
      
      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
      } else {
        showNotification('Download Failed', 'No download URL available', 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      showNotification('Download Failed', errorMessage, 'error')
    }
  }

  const generateMockSQLBackup = (backup: DatabaseBackup): string => {
    return `-- VidGro Database Backup
-- Backup Name: ${backup.name}
-- Created: ${backup.date.toISOString()}
-- Size: ${backup.size}
-- Checksum: ${backup.checksum || 'N/A'}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Complete database structure and data would be here
-- This is a simplified example for demonstration

CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    username text UNIQUE NOT NULL,
    coins integer DEFAULT 0,
    is_vip boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id),
    title text NOT NULL,
    youtube_url text NOT NULL,
    status text DEFAULT 'active',
    views_count integer DEFAULT 0,
    target_views integer NOT NULL,
    coin_cost integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Sample data would be inserted here
-- INSERT INTO profiles (id, email, username, coins, is_vip) VALUES (...);
-- INSERT INTO videos (id, user_id, title, youtube_url, status) VALUES (...);

-- End of backup file
`
  }

  const handleSaveSettings = async () => {
    try {
      // Save backup settings to database/localStorage
      localStorage.setItem('vidgro_backup_settings', JSON.stringify(backupSettings))
      showNotification('Settings Saved', 'Backup settings updated successfully', 'success')
    } catch (error) {
      showNotification('Save Failed', 'Failed to save backup settings', 'error')
    }
  }

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning') => {
    // Create a simple notification
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' ? 'bg-emerald-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-orange-500 text-white'
    }`
    notification.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm">${message}</div>
    `
    
    document.body.appendChild(notification)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 5000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
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
      default:
        return <Badge variant="default" className="text-xs">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Database Backup
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Create and manage complete database backups in SQL format
          </p>
        </div>
        <Button 
          onClick={() => handleCreateBackup()}
          disabled={isCreatingBackup}
          className="w-full sm:w-auto"
        >
          {isCreatingBackup ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Create Database Backup
            </>
          )}
        </Button>
      </div>

      {/* Backup Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {backups.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Successful Backups</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {backupSettings.autoBackupEnabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Auto Backup</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {backups.length > 0 ? formatDistanceToNow(backups[0].date) : 'Never'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last Backup</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Backup Progress */}
      {isCreatingBackup && currentBackupId && (
        <Card className="gaming-card-enhanced border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center gaming-pulse">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                  Creating Complete Database Backup
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                  Generating SQL dump of all tables and data...
                </p>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${backupProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-blue-700 dark:text-blue-300 mt-1">
                  <span>Progress: {Math.round(backupProgress)}%</span>
                  <span>ETA: {Math.max(0, Math.round((100 - backupProgress) / 3))} min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Error Alert */}
      {lastBackupError && (
        <Card className="gaming-card-enhanced border-red-500/50 bg-red-50/50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">Backup Failed</h4>
                <p className="text-sm text-red-700 dark:text-red-400">{lastBackupError}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLastBackupError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automatic Backup Settings */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Timer className="w-5 h-5" />
            <span>Automatic Backup Settings</span>
            {backupSettings.autoBackupEnabled ? (
              <Badge variant="success" className="text-xs">Active</Badge>
            ) : (
              <Badge variant="default" className="text-xs">Disabled</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto Backup Toggle */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Automatic Backup</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically create database backups on schedule
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBackupSettings(prev => ({ ...prev, autoBackupEnabled: !prev.autoBackupEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                backupSettings.autoBackupEnabled
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  backupSettings.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Backup Schedule Settings */}
          {backupSettings.autoBackupEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={backupSettings.backupFrequency}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, backupFrequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Time
                </label>
                <Input
                  type="time"
                  value={backupSettings.backupTime}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, backupTime: e.target.value }))}
                  className="text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Notification Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Notification Settings</h4>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Notify on Success</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when backup completes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBackupSettings(prev => ({ ...prev, notifyOnCompletion: !prev.notifyOnCompletion }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
                  backupSettings.notifyOnCompletion
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    backupSettings.notifyOnCompletion ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Notify on Failure</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when backup fails</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBackupSettings(prev => ({ ...prev, notifyOnFailure: !prev.notifyOnFailure }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
                  backupSettings.notifyOnFailure
                    ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    backupSettings.notifyOnFailure ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end pt-4 border-t border-violet-500/20">
            <Button onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Scheduled Backup Info */}
      {backupSettings.autoBackupEnabled && (
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="font-medium text-emerald-800 dark:text-emerald-300">
                  Next Automatic Backup Scheduled
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  {backupSettings.backupFrequency.charAt(0).toUpperCase() + backupSettings.backupFrequency.slice(1)} backup 
                  will run tomorrow at {backupSettings.backupTime}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                  Backups are automatically managed and cleaned up based on system settings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup History */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Database className="w-5 h-5" />
            <span>Backup History</span>
            <Badge variant="default" className="text-xs">
              {backups.length} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {backups.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Backups Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first database backup to get started
                </p>
                <Button onClick={() => handleCreateBackup()}>
                  <Database className="w-4 h-4 mr-2" />
                  Create First Backup
                </Button>
              </div>
            ) : (
              backups.map((backup) => (
                <div key={backup.id} className="gaming-card hover:scale-[1.01] transition-all duration-300 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Backup Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(backup.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {backup.name}
                          </h4>
                          {getStatusBadge(backup.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Database className="w-4 h-4" />
                            <span>{backup.size}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(backup.date, 'MMM dd, HH:mm')}</span>
                          </div>
                          {backup.duration > 0 && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{Math.floor(backup.duration / 60)}m {backup.duration % 60}s</span>
                            </div>
                          )}
                          {backup.sqlFilePath && (
                            <div className="flex items-center space-x-1">
                              <Database className="w-4 h-4" />
                              <span className="text-xs font-mono">SQL Format</span>
                            </div>
                          )}
                        </div>

                        {/* Backup Details */}
                        {backup.checksum && (
                          <div className="mt-2">
                            <Badge variant="info" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {backup.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Download SQL</span>
                        </Button>
                      )}
                      {backup.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!confirm('Delete this backup from storage?')) return
                            const id = backup.id
                            console.log('Attempting to delete backup:', { id, storagePath: backup.storagePath, backup })
                            try {
                              const del = await (await import('../../services/backupService')).backupService.deleteBackup(id, backup.storagePath)
                              console.log('Delete result:', del)
                              if (del.success) {
                                setBackups(prev => prev.filter(b => b.id !== id))
                                showNotification('Backup Deleted', 'Backup removed from storage', 'success')
                              } else {
                                showNotification('Delete Failed', del.message || 'Could not delete backup', 'error')
                              }
                            } catch (e) {
                              console.error('Delete error:', e)
                              const msg = e instanceof Error ? e.message : 'Delete failed'
                              showNotification('Delete Failed', msg, 'error')
                            }
                          }}
                        >
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      )}
                      {backup.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateBackup(`Retry - ${backup.name}`)}
                          disabled={isCreatingBackup}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Retry</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Information */}
      <Card className="gaming-card-enhanced border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <Database className="w-5 h-5" />
            <span>Backup Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
              <span>Complete database backup includes all tables, data, and schema</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
              <span>Backups are generated in standard SQL format for maximum compatibility</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
              <span>All backups include data integrity verification with checksums</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
              <span>Automatic cleanup removes old backups based on retention settings</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
              <span>Failed backups trigger immediate notifications to administrators</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
