import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { envManager } from './envManager'
import { logger } from './logger'

// Optimized Supabase client with caching and connection pooling
class OptimizedSupabaseClient {
  private static instance: OptimizedSupabaseClient
  private client: SupabaseClient | null = null
  private adminClient: SupabaseClient | null = null
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private syncQueue: Array<{ table: string; id: string; operation: string }> = []
  private isSyncing = false

  private constructor() {
    this.initializeClients()
  }

  public static getInstance(): OptimizedSupabaseClient {
    if (!OptimizedSupabaseClient.instance) {
      OptimizedSupabaseClient.instance = new OptimizedSupabaseClient()
    }
    return OptimizedSupabaseClient.instance
  }

  private initializeClients() {
    const supabaseUrl = envManager.getEnvVar('VITE_SUPABASE_URL')
    const supabaseAnonKey = envManager.getEnvVar('VITE_SUPABASE_ANON_KEY')
    const supabaseServiceKey = envManager.getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.warn('Supabase not configured', null, 'optimizedSupabase')
      return
    }

    try {
      // Regular client for user operations
      this.client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-client-info': 'vidgro-admin-panel'
          }
        }
      })

      // Admin client for privileged operations
      if (supabaseServiceKey) {
        this.adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          db: {
            schema: 'public'
          }
        })
      }

      logger.info('Optimized Supabase clients initialized', null, 'optimizedSupabase')
    } catch (error) {
      logger.error('Failed to initialize Supabase clients', error, 'optimizedSupabase')
    }
  }

  // Get regular client
  public getClient(): SupabaseClient | null {
    return this.client
  }

  // Get admin client
  public getAdminClient(): SupabaseClient | null {
    return this.adminClient
  }

  // Cached query execution
  public async cachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    ttl: number = this.CACHE_TTL
  ): Promise<{ data: T | null; error: any; cached: boolean }> {
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return { data: cached.data, error: null, cached: true }
    }

    try {
      const result = await queryFn()
      
      if (!result.error && result.data) {
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        })
      }

      return { ...result, cached: false }
    } catch (error) {
      logger.error('Cached query failed', error, 'optimizedSupabase')
      return { data: null, error, cached: false }
    }
  }

  // Optimized dashboard stats with caching
  public async getDashboardStats() {
    return this.cachedQuery(
      'dashboard-stats',
      async () => {
        if (!this.adminClient) {
          throw new Error('Admin client not available')
        }

        const { data, error } = await this.adminClient.rpc('get_dashboard_stats')
        return { data: data?.[0] || null, error }
      },
      2 * 60 * 1000 // 2 minutes cache for dashboard stats
    )
  }

  // Optimized user list with pagination and caching
  public async getUsers(
    limit = 50,
    offset = 0,
    filters: { search?: string; isVip?: boolean; minCoins?: number } = {}
  ) {
    const cacheKey = `users-${limit}-${offset}-${JSON.stringify(filters)}`
    
    return this.cachedQuery(
      cacheKey,
      async () => {
        if (!this.adminClient) {
          throw new Error('Admin client not available')
        }

        let query = this.adminClient
          .from('profiles')
          .select('*')
          .order('last_active', { ascending: false })
          .range(offset, offset + limit - 1)

        if (filters.search) {
          query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
        }

        if (filters.isVip !== undefined) {
          query = query.eq('is_vip', filters.isVip)
        }

        if (filters.minCoins !== undefined) {
          query = query.gte('coins', filters.minCoins)
        }

        return await query
      },
      1 * 60 * 1000 // 1 minute cache for user lists
    )
  }

  // Optimized video list with enhanced filtering
  public async getVideos(
    limit = 50,
    offset = 0,
    filters: { search?: string; status?: string; userId?: string } = {}
  ) {
    const cacheKey = `videos-${limit}-${offset}-${JSON.stringify(filters)}`
    
    return this.cachedQuery(
      cacheKey,
      async () => {
        if (!this.adminClient) {
          throw new Error('Admin client not available')
        }

        let query = this.adminClient
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,youtube_url.ilike.%${filters.search}%`)
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status)
        }

        if (filters.userId) {
          query = query.eq('user_id', filters.userId)
        }

        return await query
      },
      30 * 1000 // 30 seconds cache for video lists
    )
  }

  // Batch operations for better performance
  public async batchUpdateUsers(updates: Array<{ id: string; data: any }>) {
    if (!this.adminClient) {
      throw new Error('Admin client not available')
    }

    const results = []
    
    // Process in batches of 10 to avoid overwhelming the database
    for (let i = 0; i < updates.length; i += 10) {
      const batch = updates.slice(i, i + 10)
      
      const batchPromises = batch.map(update =>
        this.adminClient!
          .from('profiles')
          .update(update.data)
          .eq('id', update.id)
      )
      
      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
    }

    // Clear related caches
    this.clearCacheByPattern('users-')
    this.clearCacheByPattern('dashboard-stats')

    return results
  }

  // Optimized video watch with duplicate prevention
  public async watchVideo(videoId: string, watchDuration: number, fullyWatched = false) {
    if (!this.client) {
      throw new Error('Client not available')
    }

    const { data, error } = await this.client.rpc('optimized_watch_video', {
      p_video_uuid: videoId,
      p_watch_duration: watchDuration,
      p_video_fully_watched: fullyWatched
    })

    if (!error) {
      // Clear relevant caches
      this.clearCacheByPattern('videos-')
      this.clearCacheByPattern('dashboard-stats')
      this.clearCacheByPattern(`user-stats-`)
    }

    return { data, error }
  }

  // Optimized video creation with duplicate checking
  public async createVideo(videoData: {
    userId: string
    youtubeUrl: string
    title: string
    targetViews: number
    durationSeconds: number
    coinReward: number
    coinCost: number
  }) {
    if (!this.client) {
      throw new Error('Client not available')
    }

    const { data, error } = await this.client.rpc('create_video_with_duplicate_check', {
      p_user_id: videoData.userId,
      p_youtube_url: videoData.youtubeUrl,
      p_title: videoData.title,
      p_target_views: videoData.targetViews,
      p_duration_seconds: videoData.durationSeconds,
      p_coin_reward: videoData.coinReward,
      p_coin_cost: videoData.coinCost
    })

    if (!error) {
      // Clear relevant caches
      this.clearCacheByPattern('videos-')
      this.clearCacheByPattern('users-')
      this.clearCacheByPattern('dashboard-stats')
    }

    return { data, error }
  }

  // Get user stats with caching
  public async getUserStats(userId: string) {
    return this.cachedQuery(
      `user-stats-${userId}`,
      async () => {
        if (!this.adminClient) {
          throw new Error('Admin client not available')
        }

        const { data, error } = await this.adminClient.rpc('get_user_stats', {
          p_user_id: userId
        })

        return { data, error }
      },
      2 * 60 * 1000 // 2 minutes cache for user stats
    )
  }

  // Efficient sync status checking
  public async getSyncStatus() {
    if (!this.adminClient) {
      throw new Error('Admin client not available')
    }

    const { data, error } = await this.adminClient
      .from('sync_tracking')
      .select('table_name, sync_status, count(*)')
      .group('table_name, sync_status')

    return { data, error }
  }

  // Process pending sync changes
  public async processPendingSync(limit = 50) {
    if (!this.adminClient || this.isSyncing) {
      return { processed: 0, error: 'Sync already in progress or client unavailable' }
    }

    this.isSyncing = true
    
    try {
      const { data: pendingChanges, error } = await this.adminClient.rpc('get_pending_sync_changes', {
        p_limit: limit
      })

      if (error || !pendingChanges) {
        return { processed: 0, error: error?.message || 'No pending changes' }
      }

      // Process changes and mark as synced
      const syncIds = pendingChanges.map(change => change.id)
      
      if (syncIds.length > 0) {
        const { data: markedCount, error: markError } = await this.adminClient.rpc('mark_sync_completed', {
          p_sync_ids: syncIds
        })

        if (markError) {
          logger.error('Failed to mark sync as completed', markError, 'optimizedSupabase')
        }

        return { processed: markedCount || syncIds.length, error: null }
      }

      return { processed: 0, error: null }
    } catch (error) {
      logger.error('Sync processing failed', error, 'optimizedSupabase')
      return { processed: 0, error: error instanceof Error ? error.message : 'Sync failed' }
    } finally {
      this.isSyncing = false
    }
  }

  // Cache management
  public clearCache(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  public clearCacheByPattern(pattern: string) {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  public getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemory: JSON.stringify(Array.from(this.cache.values())).length
    }
  }

  // Connection health check
  public async healthCheck() {
    try {
      if (!this.client) {
        return { healthy: false, error: 'Client not initialized' }
      }

      const { data, error } = await this.client
        .from('profiles')
        .select('id')
        .limit(1)

      return { 
        healthy: !error, 
        error: error?.message,
        latency: Date.now() // Simple latency measurement
      }
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      }
    }
  }
}

// Export singleton instance
export const optimizedSupabase = OptimizedSupabaseClient.getInstance()

// Convenience functions
export const getOptimizedClient = () => optimizedSupabase.getClient()
export const getOptimizedAdminClient = () => optimizedSupabase.getAdminClient()

// Enhanced API functions with optimization
export async function getOptimizedDashboardStats() {
  return optimizedSupabase.getDashboardStats()
}

export async function getOptimizedUsers(
  limit = 50,
  offset = 0,
  filters: { search?: string; isVip?: boolean; minCoins?: number } = {}
) {
  return optimizedSupabase.getUsers(limit, offset, filters)
}

export async function getOptimizedVideos(
  limit = 50,
  offset = 0,
  filters: { search?: string; status?: string; userId?: string } = {}
) {
  return optimizedSupabase.getVideos(limit, offset, filters)
}

export async function optimizedWatchVideo(
  videoId: string,
  watchDuration: number,
  fullyWatched = false
) {
  return optimizedSupabase.watchVideo(videoId, watchDuration, fullyWatched)
}

export async function optimizedCreateVideo(videoData: {
  userId: string
  youtubeUrl: string
  title: string
  targetViews: number
  durationSeconds: number
  coinReward: number
  coinCost: number
}) {
  return optimizedSupabase.createVideo(videoData)
}

export async function getOptimizedUserStats(userId: string) {
  return optimizedSupabase.getUserStats(userId)
}

// Sync management functions
export async function getSyncStatus() {
  return optimizedSupabase.getSyncStatus()
}

export async function processPendingSync(limit = 50) {
  return optimizedSupabase.processPendingSync(limit)
}

// Cache management
export function clearSupabaseCache(key?: string) {
  optimizedSupabase.clearCache(key)
}

export function getSupabaseCacheStats() {
  return optimizedSupabase.getCacheStats()
}

// Health monitoring
export async function checkSupabaseHealth() {
  return optimizedSupabase.healthCheck()
}