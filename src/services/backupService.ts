// Database Backup Service for VidGro Admin Panel
// Handles real Supabase database backup operations

import React from 'react'
import { logger } from '../lib/logger'
import { getSupabaseAdminClient } from '../lib/supabase'

// Define backup bucket name (should match serverless function)
const BACKUP_BUCKET = 'database-backup'

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
  size: number // bytes
  duration: number
  checksum?: string
  downloadUrl?: string
  error?: string
  storagePath?: string
}

class BackupService {
  private backupQueue: Map<string, any> = new Map()

  async createBackup(options: BackupOptions): Promise<BackupResult | { success: false; error: string }> {
    const backupId = this.generateBackupId()
    const startedAt = Date.now()

    try {
      logger.info('Starting backup creation', { backupId, options }, 'backupService')

      // Track status locally (for this session)
      this.backupQueue.set(backupId, {
        id: backupId,
        status: 'running',
        progress: 0,
        startTime: new Date(),
        options
      })

      this.notifyBackupUpdate(backupId)

      // Trigger server-side backup
      const response = await fetch('/api/admin/database-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (!result?.success) {
        throw new Error(result?.message || 'Backup failed')
      }

      // Choose best download URL: publicUrl -> signedUrl -> filePath
      const storage = result.storage || {}
      const preferredUrl: string | undefined = storage.publicUrl || storage.signedUrl || result.filePath
      const storagePath: string | undefined = storage.path

      // Convert reported size (string in KB) to bytes if needed
      let sizeBytes = 0
      if (typeof result.size === 'number') sizeBytes = result.size
      if (typeof result.size === 'string') {
        const n = parseFloat(result.size)
        if (!isNaN(n)) sizeBytes = Math.round(n * 1024) // KB -> bytes
      }

      const durationMs = Date.now() - startedAt

      // Update queue
      this.backupQueue.set(backupId, {
        id: backupId,
        status: 'completed',
        progress: 100,
        startTime: new Date(startedAt),
        endTime: new Date(),
        options,
        downloadUrl: preferredUrl,
        serverPath: storagePath,
        sizeBytes
      })

      this.notifyBackupUpdate(backupId)

      logger.info('Backup completed successfully', {
        backupId,
        filename: result.filename,
        sizeBytes,
        storagePath: storage.path
      }, 'backupService')

      return {
        success: true,
        backupId,
        size: sizeBytes,
        duration: Math.round(durationMs / 1000),
        checksum: undefined,
        downloadUrl: preferredUrl,
        storagePath
      }
    } catch (error) {
      logger.error('Backup creation failed', error, 'backupService')

      this.backupQueue.set(backupId, {
        id: backupId,
        status: 'failed',
        progress: 0,
        startTime: new Date(startedAt),
        endTime: new Date(),
        options,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      this.notifyBackupUpdate(backupId)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async deleteBackup(backupId: string, storagePath?: string): Promise<{ success: boolean; message: string }> {
    try {
      const backup = this.backupQueue.get(backupId)
      const pathToDelete: string | undefined = storagePath || backup?.serverPath || backup?.storagePath

      // Request serverless delete if we have a storage path
      if (pathToDelete) {
        const response = await fetch('/api/admin/database-backup/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathToDelete })
        })
        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.message || 'Failed to delete backup from storage')
        }
      }

      this.backupQueue.delete(backupId)
      logger.info('Backup deleted', { backupId, storagePath: pathToDelete }, 'backupService')
      return { success: true, message: 'Backup deleted successfully' }
    } catch (error) {
      logger.error('Failed to delete backup', error, 'backupService')
      return { success: false, message: error instanceof Error ? error.message : 'Deletion failed' }
    }
  }

  async listExistingBackups(): Promise<{ success: boolean; backups: any[]; error?: string }> {
    try {
      const response = await fetch('/api/admin/database-backup/list')
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch backups')
      }
      const result = await response.json()
      return { success: true, backups: result.backups || [] }
    } catch (error) {
      logger.error('Failed to list backups', error, 'backupService')
      return { 
        success: false, 
        backups: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch backups' 
      }
    }
  }

  async getBackupUrls(storagePath: string): Promise<{ publicUrl?: string; signedUrl?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdminClient()
      if (!supabaseAdmin) {
        throw new Error('Storage admin not configured')
      }
      
      // Get public URL
      const { data: publicData } = supabaseAdmin.storage
        .from(BACKUP_BUCKET)
        .getPublicUrl(storagePath)
      
      // Get signed URL (valid for 1 hour)
      const { data: signedData, error } = await supabaseAdmin.storage
        .from(BACKUP_BUCKET)
        .createSignedUrl(storagePath, 3600) // 1 hour
      
      return {
        publicUrl: publicData?.publicUrl,
        signedUrl: signedData?.signedUrl
      }
    } catch (error) {
      logger.error('Failed to get backup URLs', error, 'backupService')
      return {}
    }
  }

  getBackupStatus(backupId: string): any {
    return this.backupQueue.get(backupId)
  }

  downloadBackup(backupId: string, filename?: string): void {
    const backup = this.backupQueue.get(backupId)
    if (!backup || !backup.downloadUrl) {
      throw new Error('Backup not found or not ready for download')
    }
    const link = document.createElement('a')
    link.href = backup.downloadUrl
    if (filename) link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    logger.info('Backup download initiated', { backupId, filename }, 'backupService')
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private notifyBackupUpdate(backupId: string): void {
    // Backup status updated
  }
}

export const backupService = new BackupService()

export const useBackupService = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const createBackup = async (options: BackupOptions) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await backupService.createBackup(options)
      if (!result.success) {
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

  return { createBackup, downloadBackup, isLoading, error, clearError: () => setError(null) }
}
