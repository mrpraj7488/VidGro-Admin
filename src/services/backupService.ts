// Database Backup Service for VidGro Admin Panel
// Handles real Supabase database backup operations

import React from 'react'
import { logger } from '../lib/logger'

export interface BackupOptions {
  type: 'full' | 'users' | 'videos' | 'config' | 'analytics'
  compression: 'none' | 'gzip' | 'bzip2'
  encryption: boolean
  includeBlobs: boolean
  customName?: string
}

export interface BackupResult {
  success: boolean
  backupId: string
  size: number
  duration: number
  checksum?: string
  downloadUrl?: string
  error?: string
  sqlContent?: string
}


class BackupService {
  private backupQueue: Map<string, any> = new Map()

  async createBackup(options: BackupOptions): Promise<{ success: boolean; backupId?: string; error?: string }> {
    const backupId = this.generateBackupId()
    
    try {
      logger.info('Starting backup creation', { backupId, options }, 'backupService')
      
      // Add to queue
      this.backupQueue.set(backupId, {
        id: backupId,
        status: 'running',
        progress: 0,
        startTime: new Date(),
        options
      })
      
      // Notify listeners
      this.notifyBackupUpdate(backupId)
      
      // Trigger server-side backup
      const response = await fetch('/api/admin/database-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupType: options.type,
          customName: options.customName
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Backup failed')
      }
      
      // Update backup status
      this.backupQueue.set(backupId, {
        id: backupId,
        status: 'completed',
        progress: 100,
        startTime: new Date(),
        endTime: new Date(),
        options,
        serverFile: result.filePath,
        serverFilename: result.filename,
        serverSize: result.size,
        tables: result.tables
      })
      
      logger.info('Backup completed successfully', { 
        backupId, 
        filename: result.filename,
        size: result.size,
        tables: result.tables
      }, 'backupService')
      
      // Notify listeners
      this.notifyBackupUpdate(backupId)
      
      return { success: true, backupId }
      
    } catch (error) {
      logger.error('Backup creation failed', error, 'backupService')
      
      // Update backup status
      this.backupQueue.set(backupId, {
        id: backupId,
        status: 'failed',
        progress: 0,
        startTime: new Date(),
        endTime: new Date(),
        options,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Notify listeners
      this.notifyBackupUpdate(backupId)
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }


  async deleteBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Clean up blob URL and remove from queue
      const backup = this.backupQueue.get(backupId)
      if (backup && backup.downloadUrl) {
        URL.revokeObjectURL(backup.downloadUrl)
      }
      this.backupQueue.delete(backupId)

      logger.info('Backup deleted', { backupId }, 'backupService')
      
      return {
        success: true,
        message: 'Backup deleted successfully'
      }
    } catch (error) {
      logger.error('Failed to delete backup', error, 'backupService')
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Deletion failed'
      }
    }
  }


  getBackupStatus(backupId: string): any {
    return this.backupQueue.get(backupId)
  }


  // Method to download backup as file
  downloadBackup(backupId: string, filename?: string): void {
    try {
      const backup = this.backupQueue.get(backupId)
      if (!backup || !backup.downloadUrl) {
        throw new Error('Backup not found or not ready for download')
      }

      const link = document.createElement('a')
      link.href = backup.downloadUrl
      link.download = filename || `backup_${backupId}.sql`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      logger.info('Backup download initiated', { backupId, filename }, 'backupService')
    } catch (error) {
      logger.error('Failed to download backup', error, 'backupService')
      throw error
    }
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private notifyBackupUpdate(backupId: string): void {
    console.log(`Backup status updated for ${backupId}:`, this.backupQueue.get(backupId));
  }
}

// Export singleton instance
export const backupService = new BackupService()

// React hook for backup operations
export const useBackupService = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const createBackup = async (options: BackupOptions) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await backupService.createBackup(options)
      if (!result.success) { // The new createBackup returns a string, so check if it's not empty
        setError(result.error || 'Backup failed to start')
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Backup failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }


  const downloadBackup = (backupId: string, filename?: string) => {
    try {
      backupService.downloadBackup(backupId, filename)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed'
      setError(errorMessage)
    }
  }

  return {
    createBackup,
    downloadBackup,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
