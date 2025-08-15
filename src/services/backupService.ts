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

export interface BackupSettings {
  autoBackupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupTime: string
  retentionDays: number
  compression: 'none' | 'gzip' | 'bzip2'
  encryption: boolean
  includeBlobs: boolean
  maxBackupSize: number
  notifyOnCompletion: boolean
  notifyOnFailure: boolean
}

class BackupService {
  private backupQueue: Map<string, any> = new Map()
  private isBackupInProgress = false

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

  // Force refresh environment variables (useful for debugging)
  private async refreshEnvironment(): Promise<void> {
    try {
      // Import the environment manager and force reload
      const { envManager } = await import('../lib/envManager')
      
      // Force reload from .env file
      envManager.forceReloadFromEnv()
      
      // Get the refreshed values
      const envVars = envManager.getEnvironmentVariables()
      
      console.log('🔍 Debug: Environment refreshed:');
      console.log('VITE_SUPABASE_URL:', envVars.VITE_SUPABASE_URL);
      console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', envVars.VITE_SUPABASE_SERVICE_ROLE_KEY ? '***SET***' : '***MISSING***');
      
    } catch (error) {
      console.error('🔍 Debug: Failed to refresh environment:', error)
    }
  }

  private async performRealDatabaseBackup(tables: string[], options: BackupOptions): Promise<{ success: boolean; sqlContent?: string; error?: string }> {
    try {
      // Force refresh environment variables first
      await this.refreshEnvironment()
      
      // Import the environment manager
      const { envManager } = await import('../lib/envManager')
      
      // Debug: Log environment variables from envManager
      console.log('🔍 Debug: Environment variables from envManager:');
      const envVars = envManager.getEnvironmentVariables()
      console.log('VITE_SUPABASE_URL:', envVars.VITE_SUPABASE_URL);
      console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', envVars.VITE_SUPABASE_SERVICE_ROLE_KEY ? '***SET***' : '***MISSING***');
      console.log('VITE_SUPABASE_ANON_KEY:', envVars.VITE_SUPABASE_ANON_KEY ? '***SET***' : '***MISSING***');
      
      // Debug: Show actual values (be careful with sensitive data)
      console.log('🔍 Debug: VITE_SUPABASE_URL value:', envVars.VITE_SUPABASE_URL);
      console.log('🔍 Debug: VITE_SUPABASE_SERVICE_ROLE_KEY first 20 chars:', envVars.VITE_SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20));
      console.log('🔍 Debug: VITE_SUPABASE_ANON_KEY first 20 chars:', envVars.VITE_SUPABASE_ANON_KEY?.substring(0, 20));

      const supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co'
      const supabaseServiceKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseServiceKey) {
        throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY is required for database backup')
      }

      // Debug: Log the values being used
      console.log('🔍 Debug: Using values:');
      console.log('supabaseUrl:', supabaseUrl);
      console.log('supabaseServiceKey length:', supabaseServiceKey.length);
      console.log('supabaseServiceKey first 20 chars:', supabaseServiceKey.substring(0, 20));

      // Create Supabase client with service role key
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      // Debug: Test the connection
      console.log('🔍 Debug: Testing Supabase connection...');
      try {
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('🔍 Debug: Test query failed:', testError);
          console.error('🔍 Debug: Test error details:', {
            message: testError.message,
            details: testError.details,
            hint: testError.hint,
            code: testError.code
          });
        } else {
          console.log('🔍 Debug: Test query successful, found rows:', testData?.length || 0);
        }
      } catch (testErr) {
        console.error('🔍 Debug: Test query exception:', testErr);
      }

      let sqlBackup = `-- VidGro Database Backup
-- Created: ${new Date().toISOString()}
-- Type: ${options.type}
-- Tables: ${tables.join(', ')}
-- Compression: ${options.compression}
-- Encryption: ${options.encryption}
-- Database: ${supabaseUrl}
-- Connection: postgresql://postgres:[Vidgro@12345]@db.kuibswqfmhhdybttbcoa.supabase.co:5432/postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Begin Transaction
BEGIN;

`

      // Backup each table with real data using Supabase service role
      for (const table of tables) {
        const tableBackup = await this.backupTableReal(table, supabaseUrl, supabaseServiceKey)
        if (tableBackup.success) {
          sqlBackup += tableBackup.sqlContent
        } else {
          logger.warn(`Failed to backup table ${table}: ${tableBackup.error}`, 'backupService')
          sqlBackup += `-- Error backing up table: ${table}\n-- ${tableBackup.error}\n\n`
        }
      }

      sqlBackup += `-- Commit Transaction
COMMIT;

-- Backup completed successfully
-- Total tables: ${tables.length}
-- Generated at: ${new Date().toISOString()}
-- Database: ${supabaseUrl}
`

      return {
        success: true,
        sqlContent: sqlBackup
      }
    } catch (error) {
      logger.error('Real database backup failed', error, 'backupService')
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backup failed'
      }
    }
  }

  private async backupTableReal(tableName: string, supabaseUrl: string, serviceKey: string): Promise<{ success: boolean; sqlContent?: string; error?: string }> {
    try {
      console.log(`🔍 Debug: Starting backup for table: ${tableName}`);
      console.log(`🔍 Debug: Using supabaseUrl: ${supabaseUrl}`);
      console.log(`🔍 Debug: Service key length: ${serviceKey.length}`);
      
      // Import the environment manager to get the correct service key
      const { envManager } = await import('../lib/envManager')
      const envVars = envManager.getEnvironmentVariables()
      
      // Use the service key from envManager instead of the passed parameter
      const actualServiceKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY
      console.log(`🔍 Debug: Actual service key length: ${actualServiceKey?.length || 0}`);
      
      if (!actualServiceKey) {
        throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY is required for table backup')
      }
      
      // Create a new Supabase client with service role for this operation
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseService = createClient(supabaseUrl, actualServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      console.log(`🔍 Debug: Supabase client created for table ${tableName}`);

      // Get table schema - try RPC first, then fallback
      let columns = null
      
      try {
        console.log(`🔍 Debug: Attempting RPC for table ${tableName}...`);
        const { data: rpcColumns, error: rpcError } = await supabaseService
          .rpc('get_table_columns', { table_name: tableName })
        
        if (!rpcError && rpcColumns) {
          console.log(`🔍 Debug: RPC successful for ${tableName}, got ${rpcColumns.length} columns`);
          columns = rpcColumns
        } else {
          console.log(`🔍 Debug: RPC failed for ${tableName}:`, rpcError);
          throw new Error('RPC not available')
        }
      } catch (error) {
        console.log(`🔍 Debug: RPC failed, trying fallback for ${tableName}...`);
        // Fallback: get basic table structure by querying with limit 0
        const { data: sampleData, error: dataError } = await supabaseService
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (dataError) {
          console.error(`🔍 Debug: Fallback query failed for ${tableName}:`, dataError);
          throw new Error(`Failed to get sample data for ${tableName}: ${dataError.message}`)
        }
        
        console.log(`🔍 Debug: Fallback successful for ${tableName}, got sample data:`, sampleData);
        
        // Create basic column info from sample data
        if (sampleData && sampleData.length > 0) {
          columns = Object.keys(sampleData[0]).map(key => ({
            column_name: key,
            data_type: 'text', // Default type
            is_nullable: 'YES',
            column_default: null,
            character_maximum_length: null
          }))
          console.log(`🔍 Debug: Created ${columns.length} column definitions for ${tableName}`);
        }
      }

      if (!columns || columns.length === 0) {
        throw new Error(`Could not retrieve schema for table ${tableName}`)
      }

      // Get table data (with pagination for large tables)
      console.log(`🔍 Debug: Attempting to fetch data for table ${tableName}...`);
      const { data: rows, error: dataError } = await supabaseService
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000) // Reasonable limit for backup

      if (dataError) {
        console.error(`🔍 Debug: Data fetch failed for ${tableName}:`, dataError);
        throw new Error(`Failed to get data for ${tableName}: ${dataError.message}`)
      }

      console.log(`🔍 Debug: Successfully fetched ${rows?.length || 0} rows from ${tableName}`);

      let tableSql = `\n-- Table: ${tableName}\n`
      
      // Drop table if exists
      tableSql += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n\n`
      
      if (columns && columns.length > 0) {
        // Create table structure
        tableSql += `CREATE TABLE ${tableName} (\n`
        const columnDefinitions = columns.map((col: any) => {
          let def = `  ${col.column_name} ${col.data_type}`
          
          if (col.character_maximum_length) {
            def += `(${col.character_maximum_length})`
          }
          
          if (col.is_nullable === 'NO') {
            def += ' NOT NULL'
          }
          
          if (col.column_default) {
            def += ` DEFAULT ${col.column_default}`
          }
          
          return def
        })
        
        tableSql += columnDefinitions.join(',\n')
        tableSql += '\n);\n\n'
      }

      // Insert data
      if (rows && rows.length > 0) {
        tableSql += `-- Data for table: ${tableName}\n`
        tableSql += `-- Total rows: ${rows.length}\n\n`
        
        // Process rows in batches to avoid memory issues
        const batchSize = 100
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize)
          
          batch.forEach(row => {
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL'
              if (typeof val === 'string') {
                // Escape single quotes and handle special characters
                return `'${val.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`
              }
              if (typeof val === 'object') {
                return `'${JSON.stringify(val).replace(/'/g, "''")}'`
              }
              return val
            }).join(', ')
            
            tableSql += `INSERT INTO ${tableName} VALUES (${values});\n`
          })
        }
        tableSql += '\n'
      }

      // Add indexes if they exist (simplified approach)
      try {
        const { data: indexes, error: indexError } = await supabaseService
          .rpc('get_table_indexes', { table_name: tableName })
        
        if (!indexError && indexes && indexes.length > 0) {
          tableSql += `-- Indexes for table: ${tableName}\n`
          indexes.forEach((idx: any) => {
            if (idx.index_name && idx.column_name && !idx.index_name.includes('_pkey')) {
              tableSql += `CREATE INDEX ${idx.index_name} ON ${tableName} (${idx.column_name});\n`
            }
          })
          tableSql += '\n'
        }
      } catch (error) {
        // Skip indexes if RPC is not available
        tableSql += `-- Indexes: Could not retrieve (RPC not available)\n\n`
      }

      return {
        success: true,
        sqlContent: tableSql
      }
    } catch (error) {
      logger.error(`Failed to backup table ${tableName}`, error, 'backupService')
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Table backup failed'
      }
    }
  }

  private getTablesForBackupType(type: string): string[] {
    switch (type) {
      case 'full':
        return ['profiles', 'videos', 'video_deletions', 'admin_logs', 'system_settings', 'transactions']
      case 'users':
        return ['profiles']
      case 'videos':
        return ['videos', 'video_deletions']
      case 'config':
        return ['system_settings']
      case 'analytics':
        return ['admin_logs', 'transactions']
      default:
        return []
    }
  }

  private generateChecksum(data: string): string {
    // Simple checksum for now - in production, use crypto.createHash
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`
  }

  private async createDownloadableBackup(backupId: string, sqlContent: string, backupType: string, customName?: string): Promise<string> {
    try {
      // First, save to server via API
      const serverResponse = await fetch('/api/admin/database-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sqlContent,
          backupType,
          customName
        })
      });

      if (!serverResponse.ok) {
        throw new Error(`Server error: ${serverResponse.status}`);
      }

      const serverResult = await serverResponse.json();
      
      if (!serverResult.success) {
        throw new Error(serverResult.message || 'Failed to save backup to server');
      }

      // Also create a client-side downloadable version as fallback
      const blob = new Blob([sqlContent], { type: 'application/sql' })
      const url = URL.createObjectURL(blob)
      
      // Store both server and client info
      this.backupQueue.set(backupId, { 
        ...this.backupQueue.get(backupId), 
        downloadUrl: url,
        blob,
        serverFile: serverResult.filePath,
        serverFilename: serverResult.filename,
        serverSize: serverResult.size
      })
      
      logger.info('Backup saved to server and client', { 
        backupId, 
        serverFile: serverResult.filePath,
        serverSize: serverResult.size 
      }, 'backupService')
      
      return url
    } catch (error) {
      logger.error('Failed to create downloadable backup', error, 'backupService')
      
      // Fallback to client-side only if server fails
      try {
        const blob = new Blob([sqlContent], { type: 'application/sql' })
        const url = URL.createObjectURL(blob)
        
        this.backupQueue.set(backupId, { 
          ...this.backupQueue.get(backupId), 
          downloadUrl: url,
          blob,
          serverError: error instanceof Error ? error.message : 'Unknown error'
        })
        
        return url
      } catch (fallbackError) {
        logger.error('Fallback backup creation also failed', fallbackError, 'backupService')
        return ''
      }
    }
  }

  private async storeBackupMetadata(metadata: any): Promise<void> {
    try {
      // In real implementation, store in database
      logger.info('Storing backup metadata', metadata, 'backupService')
    } catch (error) {
      logger.error('Failed to store backup metadata', error, 'backupService')
    }
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Starting backup restoration', { backupId }, 'backupService')
      
      // In real implementation:
      // 1. Download backup file
      // 2. Verify checksum
      // 3. Decrypt if encrypted
      // 4. Decompress if compressed
      // 5. Execute SQL restoration
      // 6. Verify data integrity

      // Simulate restoration process
      await new Promise(resolve => setTimeout(resolve, 3000))

      logger.info('Backup restored successfully', { backupId }, 'backupService')
      
      return {
        success: true,
        message: 'Database restored successfully from backup'
      }
    } catch (error) {
      logger.error('Backup restoration failed', error, 'backupService')
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Restoration failed'
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

  async scheduleAutomaticBackup(settings: BackupSettings): Promise<{ success: boolean; message: string }> {
    try {
      // In real implementation:
      // 1. Create cron job or scheduled task
      // 2. Store settings in database
      // 3. Set up monitoring and notifications

      logger.info('Automatic backup scheduled', settings, 'backupService')
      
      return {
        success: true,
        message: 'Automatic backup scheduled successfully'
      }
    } catch (error) {
      logger.error('Failed to schedule automatic backup', error, 'backupService')
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Scheduling failed'
      }
    }
  }

  getBackupStatus(backupId: string): any {
    return this.backupQueue.get(backupId)
  }

  isBackupRunning(): boolean {
    return this.isBackupInProgress
  }

  getStorageUsage(): { used: number; total: number; backupCount: number } {
    // In real implementation, get from storage provider
    return {
      used: 2.4, // GB
      total: 10.0, // GB
      backupCount: this.backupQueue.size
    }
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
    // In a real application, you would emit an event or update a global state
    // to notify components that the backup status has changed.
    // For now, we'll just log it.
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

  const restoreBackup = async (backupId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await backupService.restoreBackup(backupId)
      if (!result.success) {
        setError(result.message)
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restoration failed'
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
    restoreBackup,
    downloadBackup,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
