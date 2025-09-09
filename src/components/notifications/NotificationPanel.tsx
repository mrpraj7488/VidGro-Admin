import React from 'react'
import { AlertTriangle, XCircle, Info, Clock, Database, Shield, Server, Settings, Bug } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { SystemNotification } from '../../hooks/useSystemNotifications'
import { formatDistanceToNow } from 'date-fns'

interface NotificationPanelProps {
  notifications: SystemNotification[]
  onClose: () => void
}

const getNotificationIcon = (type: string, category: string) => {
  if (type === 'error') return <XCircle className="w-4 h-4 text-red-500" />
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  return <Info className="w-4 h-4 text-blue-500" />
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'database': return <Database className="w-4 h-4" />
    case 'security': return <Shield className="w-4 h-4" />
    case 'system': return <Server className="w-4 h-4" />
    case 'admin': return <Settings className="w-4 h-4" />
    case 'api': return <Bug className="w-4 h-4" />
    default: return <Info className="w-4 h-4" />
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function NotificationPanel({ 
  notifications, 
  onClose 
}: NotificationPanelProps) {
  const criticalCount = notifications.filter(n => n.severity === 'critical').length
  const highCount = notifications.filter(n => n.severity === 'high').length

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-50 max-h-80 sm:max-h-96 overflow-hidden gaming-card">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base gaming-gradient-text">System Status</h3>
          <div className="flex items-center space-x-2">
            {criticalCount > 0 && (
              <Badge variant="danger" className="text-xs px-2 py-1 shadow-sm bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="warning" className="text-xs px-2 py-1 shadow-sm bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700">
                {highCount} High
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-64 sm:max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">All Systems Healthy</p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">No issues detected</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-l-4 border-transparent hover:border-violet-500 dark:hover:border-violet-400"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type, notification.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                          {notification.title}
                        </p>
                      </div>
                      <Badge 
                        variant={notification.severity === 'critical' ? 'danger' : notification.severity === 'high' ? 'warning' : notification.severity === 'medium' ? 'warning' : 'info'}
                        className={`text-xs flex-shrink-0 shadow-sm ${
                          notification.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' :
                          notification.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700' :
                          notification.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700' :
                          'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                        }`}
                      >
                        {notification.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {notification.category !== 'security' && (
                          <>
                            {getCategoryIcon(notification.category)}
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {notification.category}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
          <span>Last check: {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
