// Runtime Configuration Service
// Handles fetching and caching of runtime configuration from the backend

import { logger } from '../lib/logger'
import { ClientRuntimeConfig } from '../types/admin'

class ConfigService {
  private cache: Map<string, { data: ClientRuntimeConfig; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

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
      const response = await fetch(`${this.API_BASE_URL}/api/client-runtime-config?env=${environment}`, {
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
    
    try {
      // Also clear server-side cache
      await fetch(`${this.API_BASE_URL}/api/admin/clear-config-cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLIENT_API_KEY || 'demo-key'
        }
      })
      
      logger.info('Configuration cache cleared', null, 'configService')
    } catch (error) {
      logger.error('Failed to clear server cache', error, 'configService')
    }
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Helper method to get a specific config value
  async getConfigValue(key: string, environment = 'production'): Promise<string | null> {
    const config = await this.getClientConfig(environment)
    return config?.config[key] || null
  }

  // Helper method to check if a feature is enabled
  async isFeatureEnabled(featureName: string, environment = 'production'): Promise<boolean> {
    const value = await this.getConfigValue(`FEATURE_${featureName.toUpperCase()}_ENABLED`, environment)
    return value === 'true'
  }

  // Helper method to get all configs for a category
  async getCategoryConfig(category: string, environment = 'production'): Promise<Record<string, string> | null> {
    const config = await this.getClientConfig(environment)
    return config?.categories[category] || null
  }
}

// Export singleton instance
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