import { supabase, supabaseAdmin } from '../lib/supabase'
import { RealtimeChannel, REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'

export interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  schema: string
  table: string
  new?: any
  old?: any
}

export interface NotificationPayload {
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  timestamp: string
  data?: any
}

export class RealtimeService {
  private subscriptions: Map<string, RealtimeChannel> = new Map()
  private isConnected = false
  private callbacks: Map<string, (payload: any) => void> = new Map()
  private connectionCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    this.setupConnectionMonitoring()
  }

  private setupConnectionMonitoring() {
    // Monitor connection status with periodic checks
    this.connectionCheckInterval = setInterval(() => {
      // Check if we have active subscriptions as a proxy for connection status
      const hasActiveSubscriptions = this.subscriptions.size > 0
      const newConnectionStatus = hasActiveSubscriptions
      
      if (newConnectionStatus !== this.isConnected) {
        this.isConnected = newConnectionStatus
        console.log(newConnectionStatus ? '✅ Realtime connection active' : '❌ Realtime connection inactive')
      }
    }, 5000)
    
    console.log('🔄 Realtime service initialized')
  }

  // Subscribe to admin dashboard updates
  subscribeToAdminUpdates(callback: (event: RealtimeEvent) => void): RealtimeChannel {
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload) => {
          console.log('👤 User update:', payload)
          callback({
            eventType: payload.eventType as any,
            schema: 'public',
            table: 'profiles',
            new: payload.new,
            old: payload.old
          })
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'videos' },
        (payload) => {
          console.log('🎥 Video update:', payload)
          callback({
            eventType: payload.eventType as any,
            schema: 'public',
            table: 'videos',
            new: payload.new,
            old: payload.old
          })
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('💰 Transaction update:', payload)
          callback({
            eventType: payload.eventType as any,
            schema: 'public',
            table: 'transactions',
            new: payload.new,
            old: payload.old
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Admin subscription status:', status)
      })

    this.subscriptions.set('admin-dashboard', channel)
    return channel
  }

  // Subscribe to specific user updates (for user management)
  subscribeToUserUpdates(userId: string, callback: (event: RealtimeEvent) => void): RealtimeChannel {
    const channel = supabase
      .channel(`user-${userId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          console.log(`👤 User ${userId} updated:`, payload)
          callback({
            eventType: payload.eventType as any,
            schema: 'public',
            table: 'profiles',
            new: payload.new,
            old: payload.old
          })
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'videos', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log(`🎥 User ${userId} video updated:`, payload)
          callback({
            eventType: payload.eventType as any,
            schema: 'public',
            table: 'videos',
            new: payload.new,
            old: payload.old
          })
        }
      )
      .subscribe((status) => {
        console.log(`📡 User ${userId} subscription status:`, status)
      })

    this.subscriptions.set(`user-${userId}`, channel)
    return channel
  }

  // Subscribe to video updates
  subscribeToVideoUpdates(callback: (event: RealtimeEvent) => void): RealtimeChannel {
    const channel = supabase
      .channel('video-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos' },
        (payload) => {
          console.log('🎥 Video update:', payload)
          callback({
            eventType: payload.eventType as any,
            schema: 'public',
            table: 'videos',
            new: payload.new,
            old: payload.old
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Video subscription status:', status)
      })

    this.subscriptions.set('video-updates', channel)
    return channel
  }

  // Send notification to specific user
  async sendUserNotification(userId: string, notification: NotificationPayload): Promise<void> {
    try {
      const channel = supabase.channel(`user-notifications-${userId}`)
      
      await channel.send({
        type: 'broadcast',
        event: 'admin_notification',
        payload: notification
      })

      console.log(`📤 Notification sent to user ${userId}:`, notification)
    } catch (error) {
      console.error('Failed to send user notification:', error)
    }
  }

  // Send bulk notifications
  async sendBulkNotification(userIds: string[], notification: NotificationPayload): Promise<void> {
    try {
      const promises = userIds.map(userId => this.sendUserNotification(userId, notification))
      await Promise.all(promises)
      console.log(`📤 Bulk notification sent to ${userIds.length} users`)
    } catch (error) {
      console.error('Failed to send bulk notification:', error)
    }
  }

  // Broadcast admin action to all connected clients
  async broadcastAdminAction(action: string, data: any): Promise<void> {
    try {
      const channel = supabase.channel('admin-broadcast')
      
      await channel.send({
        type: 'broadcast',
        event: 'admin_action',
        payload: {
          action,
          data,
          timestamp: new Date().toISOString(),
          adminId: 'current-admin-id' // TODO: Get from auth context
        }
      })

      console.log(`📢 Admin action broadcasted:`, { action, data })
    } catch (error) {
      console.error('Failed to broadcast admin action:', error)
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Get active subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys())
  }

  // Unsubscribe from specific channel
  unsubscribe(channelName: string): void {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.subscriptions.delete(channelName)
      console.log(`🔌 Unsubscribed from ${channelName}`)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel, name) => {
      channel.unsubscribe()
      console.log(`🔌 Unsubscribed from ${name}`)
    })
    this.subscriptions.clear()
    
    // Clear connection monitoring
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
      this.connectionCheckInterval = null
    }
  }

  // Reconnect all subscriptions
  async reconnect(): Promise<void> {
    console.log('🔄 Reconnecting realtime subscriptions...')
    
    // Store current subscriptions
    const currentSubs = Array.from(this.subscriptions.keys())
    
    // Unsubscribe all
    this.unsubscribeAll()
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Resubscribe based on stored subscriptions
    currentSubs.forEach(subName => {
      if (subName === 'admin-dashboard') {
        const callback = this.callbacks.get(subName)
        if (callback) {
          this.subscribeToAdminUpdates(callback)
        }
      }
      // Add other subscription types as needed
    })
  }

  // Store callback for reconnection
  storeCallback(channelName: string, callback: (event: RealtimeEvent) => void): void {
    this.callbacks.set(channelName, callback)
  }
}

// Singleton instance
export const realtimeService = new RealtimeService()

// Notification helper functions
export const createNotification = (
  title: string, 
  message: string, 
  type: NotificationPayload['type'] = 'info',
  data?: any
): NotificationPayload => ({
  title,
  message,
  type,
  timestamp: new Date().toISOString(),
  data
})

export const createCoinAdjustmentNotification = (amount: number, reason: string): NotificationPayload => 
  createNotification(
    amount > 0 ? 'Coins Added!' : 'Coins Deducted',
    `${Math.abs(amount)} coins ${amount > 0 ? 'added to' : 'removed from'} your account. Reason: ${reason}`,
    amount > 0 ? 'success' : 'warning',
    { amount, reason }
  )

export const createVideoStatusNotification = (title: string, status: string): NotificationPayload => {
  const statusMessages = {
    'active': 'Your video is now being promoted!',
    'paused': 'Your video promotion has been paused',
    'completed': 'Your video promotion completed successfully!',
    'rejected': 'Your video was rejected. Please check the guidelines.',
    'repromoted': 'Your video is being promoted again!'
  }
  
  return createNotification(
    'Video Status Update',
    statusMessages[status as keyof typeof statusMessages] || `Status changed to: ${status}`,
    status === 'rejected' ? 'error' : 'info',
    { title, status }
  )
}

export const createVipStatusNotification = (isVip: boolean): NotificationPayload =>
  createNotification(
    isVip ? '🌟 VIP Activated!' : 'VIP Status Removed',
    isVip 
      ? 'You now have access to VIP features!' 
      : 'Your VIP privileges have been removed.',
    'info',
    { isVip }
  )