// Runtime Configuration Service
// Handles fetching and caching of runtime configuration from the backend

import { logger } from '../lib/logger'
import { ClientRuntimeConfig } from '../types/admin'

class ConfigService {
  private cache: Map<string, { data: ClientRuntimeConfig; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  
  // For Netlify deployment, use relative URLs or environment-based URLs
  private getApiBaseUrl(): string {
    // In development, use localhost
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    }
    
    // In production (Netlify), use the Netlify URL
    return import.meta.env.VITE_API_BASE_URL || 'https://admin-vidgro.netlify.app'
  }

  async getClientConfig(environment = 'production', forceRefresh = false): Promise<ClientRuntimeConfig | null> {
    const cacheKey = `client-config-${environment}`
    
    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey)
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        logger.debug('Returning cached client config', { environment }, 'configService')
        return cached.data
      }
    }

    try {
      const apiBaseUrl = this.getApiBaseUrl()
      const configUrl = `${apiBaseUrl}/api/client-runtime-config`

      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLIENT_API_KEY || 'demo-key',
          'x-env': environment,
          'x-app-version': '1.0.0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const config = result.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: config,
        timestamp: Date.now()
      })

      logger.info('Client config fetched successfully', { environment, cached: result.cached }, 'configService')
      return config
    } catch (error) {
      logger.error('Failed to fetch client config', error, 'configService')
      
      // Return cached data if available, even if expired
      const cached = this.cache.get(cacheKey)
      if (cached) {
        logger.warn('Returning expired cached config due to fetch failure', { environment }, 'configService')
        return cached.data
      }
      
      return null
    }
  }

  async clearCache(): Promise<void> {
    this.cache.clear()
    logger.info('Config cache cleared', {}, 'configService')
  }

  async syncEnvironmentVariables(envVars: Record<string, string>): Promise<boolean> {
    try {
      const apiBaseUrl = this.getApiBaseUrl()
      const syncUrl = `${apiBaseUrl}/api/admin/env-sync`

      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': import.meta.env.VITE_ADMIN_EMAIL || 'admin@vidgro.com'
        },
        body: JSON.stringify(envVars)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Clear cache to force refresh
        await this.clearCache()
        logger.info('Environment variables synced successfully', { envVars: Object.keys(envVars) }, 'configService')
        return true
      } else {
        logger.error('Environment sync failed', { error: result.message }, 'configService')
        return false
      }
    } catch (error) {
      logger.error('Failed to sync environment variables', error, 'configService')
      return false
    }
  }

  async getAdminConfig(environment = 'production'): Promise<any> {
    try {
      const apiBaseUrl = this.getApiBaseUrl()
      const configUrl = `${apiBaseUrl}/api/admin/runtime-config?env=${environment}`

      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': import.meta.env.VITE_ADMIN_EMAIL || 'admin@vidgro.com'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      logger.info('Admin config fetched successfully', { environment }, 'configService')
      return result
    } catch (error) {
      logger.error('Failed to fetch admin config', error, 'configService')
      return null
    }
  }

  async updateRuntimeConfig(config: any): Promise<boolean> {
    try {
      const apiBaseUrl = this.getApiBaseUrl()
      const configUrl = `${apiBaseUrl}/api/admin/runtime-config`

      const response = await fetch(configUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': import.meta.env.VITE_ADMIN_EMAIL || 'admin@vidgro.com'
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success !== false) {
        // Clear cache to force refresh
        await this.clearCache()
        logger.info('Runtime config updated successfully', { config: config.key }, 'configService')
        return true
      } else {
        logger.error('Runtime config update failed', { error: result.message }, 'configService')
        return false
      }
    } catch (error) {
      logger.error('Failed to update runtime config', error, 'configService')
      return false
    }
  }

  async deleteRuntimeConfig(key: string, environment = 'production'): Promise<boolean> {
    try {
      const apiBaseUrl = this.getApiBaseUrl()
      const configUrl = `${apiBaseUrl}/api/admin/runtime-config/${key}?env=${environment}`

      const response = await fetch(configUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': import.meta.env.VITE_ADMIN_EMAIL || 'admin@vidgro.com'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success !== false) {
        // Clear cache to force refresh
        await this.clearCache()
        logger.info('Runtime config deleted successfully', { key }, 'configService')
        return true
      } else {
        logger.error('Runtime config deletion failed', { error: result.message }, 'configService')
        return false
      }
    } catch (error) {
      logger.error('Failed to delete runtime config', error, 'configService')
      return false
    }
  }

  async getAuditLogs(params: { key?: string; env?: string; days?: number; limit?: number } = {}): Promise<any> {
    try {
      const apiBaseUrl = this.getApiBaseUrl()
      const queryParams = new URLSearchParams()
      
      if (params.key) queryParams.append('key', params.key)
      if (params.env) queryParams.append('env', params.env)
      if (params.days) queryParams.append('days', params.days.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      
      const configUrl = `${apiBaseUrl}/api/admin/config-audit-logs?${queryParams.toString()}`

      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': import.meta.env.VITE_ADMIN_EMAIL || 'admin@vidgro.com'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      logger.info('Audit logs fetched successfully', { params }, 'configService')
      return result
    } catch (error) {
      logger.error('Failed to fetch audit logs', error, 'configService')
      return null
    }
  }
}

export const configService = new ConfigService()

// React hook for using config service
export const useRuntimeConfig = (environment = 'production') => {
  const [config, setConfig] = React.useState<ClientRuntimeConfig | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchConfig = React.useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await configService.getClientConfig(environment, forceRefresh)
      setConfig(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch config')
    } finally {
      setIsLoading(false)
    }
  }, [environment])

  React.useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const getConfigValue = React.useCallback((key: string) => {
    return config?.config[key] || null
  }, [config])

  const isFeatureEnabled = React.useCallback((featureName: string) => {
    return getConfigValue(`FEATURE_${featureName.toUpperCase()}_ENABLED`) === 'true'
  }, [getConfigValue])

  return {
    config,
    isLoading,
    error,
    refetch: () => fetchConfig(true),
    getConfigValue,
    isFeatureEnabled
  }
}
