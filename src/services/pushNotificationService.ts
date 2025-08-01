// Push Notification Service for VidGro Admin Panel
// Handles sending notifications to mobile app users

export interface NotificationPayload {
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  timestamp: string
  data?: any
}

export interface PushNotificationData {
  userId: string
  title: string
  body: string
  data?: Record<string, any>
  type: 'coin_adjustment' | 'video_status_change' | 'vip_status_change' | 'general'
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private fcmServerKey: string | null = null

  private constructor() {
    this.fcmServerKey = import.meta.env.VITE_FCM_SERVER_KEY || null
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  // Send coin adjustment notification
  async sendCoinAdjustmentNotification(
    userId: string, 
    amount: number, 
    reason: string,
    fcmToken?: string
  ): Promise<boolean> {
    try {
      const notification: PushNotificationData = {
        userId,
        title: amount > 0 ? 'Coins Added!' : 'Coins Deducted',
        body: `${Math.abs(amount)} coins ${amount > 0 ? 'added to' : 'removed from'} your account. Reason: ${reason}`,
        type: 'coin_adjustment',
        data: {
          amount: amount.toString(),
          reason,
          userId
        }
      }

      return await this.sendNotification(notification, fcmToken)
    } catch (error) {
      console.error('Failed to send coin adjustment notification:', error)
      return false
    }
  }

  // Send video status change notification
  async sendVideoStatusNotification(
    userId: string,
    videoTitle: string,
    newStatus: string,
    fcmToken?: string
  ): Promise<boolean> {
    try {
      const statusMessages = {
        'active': 'Your video is now being promoted!',
        'paused': 'Your video promotion has been paused',
        'completed': 'Your video promotion completed successfully!',
        'rejected': 'Your video was rejected. Please check guidelines.',
        'repromoted': 'Your video is being promoted again!'
      }

      const notification: PushNotificationData = {
        userId,
        title: 'Video Status Update',
        body: statusMessages[newStatus as keyof typeof statusMessages] || `Status changed to: ${newStatus}`,
        type: 'video_status_change',
        data: {
          videoTitle,
          status: newStatus,
          userId
        }
      }

      return await this.sendNotification(notification, fcmToken)
    } catch (error) {
      console.error('Failed to send video status notification:', error)
      return false
    }
  }

  // Send VIP status change notification
  async sendVipStatusNotification(
    userId: string,
    isVip: boolean,
    fcmToken?: string
  ): Promise<boolean> {
    try {
      const notification: PushNotificationData = {
        userId,
        title: isVip ? '🌟 VIP Activated!' : 'VIP Status Removed',
        body: isVip 
          ? 'You now have access to premium features!' 
          : 'Your VIP privileges have been removed.',
        type: 'vip_status_change',
        data: {
          isVip: isVip.toString(),
          userId
        }
      }

      return await this.sendNotification(notification, fcmToken)
    } catch (error) {
      console.error('Failed to send VIP status notification:', error)
      return false
    }
  }

  // Send bulk notification to multiple users
  async sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    const promises = userIds.map(async (userId) => {
      try {
        const notification: PushNotificationData = {
          userId,
          title,
          body: message,
          type: 'general',
          data: { type, bulk: true }
        }

        const sent = await this.sendNotification(notification)
        if (sent) success++
        else failed++
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error)
        failed++
      }
    })

    await Promise.all(promises)
    return { success, failed }
  }

  // Core notification sending method
  private async sendNotification(
    notification: PushNotificationData,
    fcmToken?: string
  ): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Get the user's FCM token from database if not provided
      // 2. Send the notification via Firebase Cloud Messaging
      // 3. Handle delivery receipts and failures
      
      // Mock implementation for demo
      console.log('📱 Sending push notification:', {
        to: notification.userId,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        data: notification.data
      })

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100))

      // Simulate 95% success rate
      return Math.random() > 0.05
    } catch (error) {
      console.error('Push notification send error:', error)
      return false
    }
  }

  // Get notification statistics
  async getNotificationStats(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<{
    sent: number
    delivered: number
    failed: number
    clickRate: number
  }> {
    // Mock implementation - in real app, this would query analytics
    return {
      sent: Math.floor(Math.random() * 10000) + 5000,
      delivered: Math.floor(Math.random() * 9500) + 4500,
      failed: Math.floor(Math.random() * 500) + 100,
      clickRate: Math.random() * 0.3 + 0.1 // 10-40% click rate
    }
  }

  // Test notification functionality
  async testNotification(userId: string): Promise<boolean> {
    return await this.sendNotification({
      userId,
      title: '🧪 Test Notification',
      body: 'This is a test notification from VidGro Admin Panel',
      type: 'general',
      data: { test: true }
    })
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance()

// Helper functions for creating notifications
export const createCoinAdjustmentNotification = (amount: number, reason: string): NotificationPayload => ({
  title: amount > 0 ? 'Coins Added!' : 'Coins Deducted',
  message: `${Math.abs(amount)} coins ${amount > 0 ? 'added to' : 'removed from'} your account. Reason: ${reason}`,
  type: amount > 0 ? 'success' : 'warning',
  timestamp: new Date().toISOString(),
  data: { amount, reason }
})

export const createVideoStatusNotification = (title: string, status: string): NotificationPayload => {
  const statusMessages = {
    'active': 'Your video is now being promoted!',
    'paused': 'Your video promotion has been paused',
    'completed': 'Your video promotion completed successfully!',
    'rejected': 'Your video was rejected. Please check the guidelines.',
    'repromoted': 'Your video is being promoted again!'
  }
  
  return {
    title: 'Video Status Update',
    message: statusMessages[status as keyof typeof statusMessages] || `Status changed to: ${status}`,
    type: status === 'rejected' ? 'error' : 'info',
    timestamp: new Date().toISOString(),
    data: { title, status }
  }
}

export const createVipStatusNotification = (isVip: boolean): NotificationPayload => ({
  title: isVip ? '🌟 VIP Activated!' : 'VIP Status Removed',
  message: isVip 
    ? 'You now have access to VIP features!' 
    : 'Your VIP privileges have been removed.',
  type: 'info',
  timestamp: new Date().toISOString(),
  data: { isVip }
})