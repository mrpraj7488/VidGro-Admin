import React, { useState, useEffect } from 'react'
import { Download, Upload, Database, Calendar, CheckCircle, AlertTriangle, RefreshCw, HardDrive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { format } from 'date-fns'
import { getSupabaseClient } from '../../lib/supabase'

export function BackupScreen() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backups, setBackups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Get backup records from database
      const { data: backupData, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform backup data
      const transformedBackups = backupData?.map(backup => ({
        id: backup.id,
        name: backup.name,
        type: backup.type,
        size: backup.size,
        date: new Date(backup.created_at),
        status: backup.status
      })) || []

      setBackups(transformedBackups)
    } catch (error) {
      console.error('Failed to fetch backups:', error)
      // Set empty array on error
      setBackups([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBackup = async (type: string) => {
    setIsCreatingBackup(true)
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsCreatingBackup(false)
  }

  const handleRestoreBackup = async (backupId: number) => {
    setIsRestoring(true)
    // Simulate backup restoration
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRestoring(false)
  }

  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Database className="w-5 h-5" />
      case 'users': return <Database className="w-5 h-5" />
      case 'videos': return <Database className="w-5 h-5" />
      default: return <Database className="w-5 h-5" />
    }
  }

  const getBackupTypeBadge = (type: string) => {
    switch (type) {
      case 'full': return <Badge variant="info">Full System</Badge>
      case 'users': return <Badge variant="success">User Data</Badge>
      case 'videos': return <Badge variant="warning">Video Data</Badge>
      default: return <Badge variant="default">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
          Backup & Restore
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage system backups and data restoration
        </p>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 gaming-glow">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Full System Backup</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Complete backup of all system data
            </p>
            <Button 
              onClick={() => handleCreateBackup('full')}
              disabled={isCreatingBackup}
              className="w-full"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 gaming-glow">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Data Backup</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Backup user profiles and settings
            </p>
            <Button 
              onClick={() => handleCreateBackup('users')}
              disabled={isCreatingBackup}
              variant="success"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup Users
            </Button>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 gaming-glow">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Video Data Backup</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Backup video metadata and stats
            </p>
            <Button 
              onClick={() => handleCreateBackup('videos')}
              disabled={isCreatingBackup}
              variant="warning"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup Videos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5" />
            <span>Backup History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-8">Loading backups...</p>
            ) : backups.length === 0 ? (
              <p className="text-center py-8">No backups found. Create one to see history.</p>
            ) : (
              backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 gaming-card hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      {getBackupTypeIcon(backup.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{backup.name}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        {getBackupTypeBadge(backup.type)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">{backup.size}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(backup.date, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">Completed</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={isRestoring}
                      >
                        {isRestoring ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Backup Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 gaming-card">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Daily Automatic Backup</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create daily backups automatically</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 translate-x-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 gaming-card">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Backup Retention</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keep backups for 30 days</p>
              </div>
              <select className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
                <option value="7">7 days</option>
                <option value="30" selected>30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 gaming-card">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Cloud Storage</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Store backups in cloud storage</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-all duration-300"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
