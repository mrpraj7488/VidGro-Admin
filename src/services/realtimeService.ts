import { getSupabaseClient } from '../lib/supabase'
import { logger } from '../lib/logger'

export interface RealtimeEvent {
  type: 'user_update' | 'video_update' | 'coin_adjustment' | 'system_notification'
  payload: any
  timestamp: string
}

export interface NotificationPayload {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  data?: Record<string, any>
}

class RealtimeService {
  private subscriptions: Map<string, any> = new Map()
  private isConnected = false

  async initialize() {
    try {
      // Initialize real-time connection
      this.isConnected = true
      logger.info('Realtime service initialized', null, 'realtimeService')
    } catch (error) {
      logger.error('Failed to initialize realtime service', error, 'realtimeService')
      this.isConnected = false
    }
  }

  async subscribeToUserUpdates(callback: (event: RealtimeEvent) => void) {
    if (!this.isConnected) {
      logger.warn('Realtime service not connected', null, 'realtimeService')
      return
    }

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const subscription = supabase
        .channel('user-updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            callback({
              type: 'user_update',
              payload,
              timestamp: new Date().toISOString()
            })
          }
        )
        .subscribe()

      this.subscriptions.set('user-updates', subscription)
    } catch (error) {
      logger.error('Failed to subscribe to user updates', error, 'realtimeService')
    }
  }

  async subscribeToVideoUpdates(callback: (event: RealtimeEvent) => void) {
    if (!this.isConnected) {
      logger.warn('Realtime service not connected', null, 'realtimeService')
      return
    }

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const subscription = supabase
        .channel('video-updates')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'videos' },
          (payload) => {
            callback({
              type: 'video_update',
              payload,
              timestamp: new Date().toISOString()
            })
          }
        )
        .subscribe()

      this.subscriptions.set('video-updates', subscription)
    } catch (error) {
      logger.error('Failed to subscribe to video updates', error, 'realtimeService')
    }
  }

  async sendUserNotification(userId: string, notification: NotificationPayload) {
    try {
      logger.info('Sending notification to user', { userId, notification }, 'realtimeService')
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { success: true, messageId: `msg_${Date.now()}` }
    } catch (error) {
      logger.error('Failed to send user notification', error, 'realtimeService')
      throw error
    }
  }

  async sendBulkNotification(userIds: string[], notification: NotificationPayload) {
    try {
      const results = await Promise.all(
        userIds.map(userId => this.sendUserNotification(userId, notification))
      )
      
      return {
        success: true,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    } catch (error) {
      logger.error('Failed to send bulk notification', error, 'realtimeService')
      throw error
    }
  }

  unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName)
    if (subscription) {
      const supabase = getSupabaseClient()
      if (supabase) {
      supabase.removeChannel(subscription)
      }
      this.subscriptions.delete(channelName)
    }
  }

  disconnect() {
    // Unsubscribe from all channels
    for (const [channelName] of this.subscriptions) {
      this.unsubscribe(channelName)
    }
    
    this.isConnected = false
    logger.info('Realtime service disconnected', null, 'realtimeService')
  }

  getConnectionStatus() {
    return this.isConnected
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService()

// Notification helper functions
export function createCoinAdjustmentNotification(amount: number, reason: string): NotificationPayload {
  const isPositive = amount > 0
  return {
    title: isPositive ? 'Coins Added' : 'Coins Deducted',
    message: `${isPositive ? '+' : ''}${amount} coins ${isPositive ? 'added to' : 'deducted from'} your account. Reason: ${reason}`,
    type: isPositive ? 'success' : 'warning',
    data: {
      amount,
      reason,
      type: 'coin_adjustment'
    }
  }
}

export function createVideoStatusNotification(videoTitle: string, status: string): NotificationPayload {
  const statusMessages = {
    active: 'Your video promotion is now active',
    paused: 'Your video promotion has been paused',
    completed: 'Your video promotion has completed successfully',
    rejected: 'Your video promotion was rejected',
    approved: 'Your video promotion has been approved'
  }

  const statusTypes = {
    active: 'success',
    paused: 'warning',
    completed: 'success',
    rejected: 'error',
    approved: 'success'
  } as const

  return {
    title: 'Video Status Update',
    message: `"${videoTitle}" - ${statusMessages[status] || `Status changed to ${status}`}`,
    type: statusTypes[status] || 'info',
    data: {
      videoTitle,
      status,
      type: 'video_status'
    }
  }
}

export function createSystemNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): NotificationPayload {
  return {
    title,
    message,
    type,
    data: {
      type: 'system_notification'
    }
  }
}

// Auto-initialize the service
realtimeService.initialize()