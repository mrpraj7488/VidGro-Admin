import { useState, useEffect } from 'react'
import { getSupabaseAdminClient } from '../lib/supabase'

export interface SystemNotification {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  category: 'database' | 'api' | 'system' | 'admin' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
}

export function useSystemNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const generateSystemNotifications = async (): Promise<SystemNotification[]> => {
    const notifications: SystemNotification[] = []
    const supabase = getSupabaseAdminClient()
    
    if (!supabase) {
      notifications.push({
        id: 'db-connection-error',
        type: 'error',
        title: 'Database Connection Error',
        message: 'Unable to connect to Supabase database',
        timestamp: new Date().toISOString(),
        category: 'database',
        severity: 'critical',
        isRead: false
      })
      return notifications
    }

    try {
      // Check database health
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1)
      if (dbError) {
        notifications.push({
          id: 'db-query-error',
          type: 'error',
          title: 'Database Query Error',
          message: `Database query failed: ${dbError.message}`,
          timestamp: new Date().toISOString(),
          category: 'database',
          severity: 'high',
          isRead: false
        })
      }

      // Check for recent security events - only if table exists
      try {
        const { data: securityEvents, error: securityError } = await supabase
          .from('security_events')
          .select('*')
          .eq('severity', 'high')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5)

        if (securityError) {
          // Only add notification if it's not a "table doesn't exist" error
          if (!securityError.message.includes('relation "security_events" does not exist') && 
              !securityError.message.includes('relation "public.security_events" does not exist')) {
            notifications.push({
              id: 'security-check-error',
              type: 'warning',
              title: 'Security Check Failed',
              message: `Security monitoring error: ${securityError.message}`,
              timestamp: new Date().toISOString(),
              category: 'security',
              severity: 'medium',
              isRead: false
            })
          }
        } else if (securityEvents && securityEvents.length > 0) {
          securityEvents.forEach((event, index) => {
            notifications.push({
              id: `security-event-${event.id}`,
              type: 'warning',
              title: 'Security Alert',
              message: `${event.event_type}: ${event.description}`,
              timestamp: event.created_at,
              category: 'security',
              severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
              isRead: false
            })
          })
        }
      } catch (securityCheckError) {
        // Silently skip security check if table doesn't exist
        // Security events table not available
      }

      // Check for failed transactions or system errors
      const { data: recentErrors, error: errorCheckError } = await supabase
        .from('admin_logs')
        .select('*')
        .contains('new_values', { error: true })
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(3)

      if (errorCheckError) {
        notifications.push({
          id: 'error-log-check-failed',
          type: 'warning',
          title: 'Error Log Check Failed',
          message: 'Unable to check recent system errors',
          timestamp: new Date().toISOString(),
          category: 'system',
          severity: 'medium',
          isRead: false
        })
      } else if (recentErrors && recentErrors.length > 0) {
        notifications.push({
          id: 'recent-system-errors',
          type: 'error',
          title: 'System Errors Detected',
          message: `${recentErrors.length} system errors in the last hour`,
          timestamp: new Date().toISOString(),
          category: 'system',
          severity: 'high',
          isRead: false
        })
      }

      // Check for high priority bug reports
      const { data: criticalBugs, error: bugError } = await supabase
        .from('bug_reports')
        .select('*')
        .eq('priority', 'critical')
        .eq('status', 'open')
        .limit(5)

      if (bugError) {
        notifications.push({
          id: 'bug-check-error',
          type: 'warning',
          title: 'Bug Report Check Failed',
          message: 'Unable to check critical bug reports',
          timestamp: new Date().toISOString(),
          category: 'system',
          severity: 'medium',
          isRead: false
        })
      } else if (criticalBugs && criticalBugs.length > 0) {
        notifications.push({
          id: 'critical-bugs',
          type: 'error',
          title: 'Critical Bugs Detected',
          message: `${criticalBugs.length} critical bugs require immediate attention`,
          timestamp: new Date().toISOString(),
          category: 'system',
          severity: 'critical',
          isRead: false
        })
      }

      // Check environment configuration
      const requiredEnvVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_ADMIN_EMAIL',
        'VITE_ADMIN_SECRET_KEY'
      ]

      const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName])
      if (missingEnvVars.length > 0) {
        notifications.push({
          id: 'missing-env-vars',
          type: 'error',
          title: 'Configuration Error',
          message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
          timestamp: new Date().toISOString(),
          category: 'admin',
          severity: 'high',
          isRead: false
        })
      }

    } catch (error) {
      notifications.push({
        id: 'system-check-error',
        type: 'error',
        title: 'System Health Check Failed',
        message: `Unable to perform system health checks: ${error}`,
        timestamp: new Date().toISOString(),
        category: 'system',
        severity: 'high',
        isRead: false
      })
    }

    return notifications
  }

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const systemNotifications = await generateSystemNotifications()
      const filteredNotifications = filterResolvedNotifications(systemNotifications)
      setNotifications(filteredNotifications)
      setUnreadCount(filteredNotifications.length) // All notifications are considered unread for system alerts
    } catch (error) {
      // Failed to fetch system notifications
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-remove resolved notifications
  const filterResolvedNotifications = (notifications: SystemNotification[]) => {
    return notifications.filter(notification => {
      // Remove old notifications (older than 24 hours for non-critical)
      const notificationAge = Date.now() - new Date(notification.timestamp).getTime()
      const maxAge = notification.severity === 'critical' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days for critical, 1 day for others
      
      return notificationAge < maxAge
    })
  }

  useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: fetchNotifications
  }
}
