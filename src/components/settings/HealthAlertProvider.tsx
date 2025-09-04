import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AlertTriangle, XCircle, Bell } from 'lucide-react'
import { Badge } from '../ui/Badge'

interface HealthAlert {
  id: string
  type: 'error' | 'warning'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}

interface HealthAlertContextType {
  alerts: HealthAlert[]
  addAlert: (alert: Omit<HealthAlert, 'id' | 'timestamp' | 'acknowledged'>) => void
  acknowledgeAlert: (id: string) => void
  clearAlert: (id: string) => void
  getUnacknowledgedCount: () => number
}

const HealthAlertContext = createContext<HealthAlertContextType | undefined>(undefined)

export const useHealthAlerts = () => {
  const context = useContext(HealthAlertContext)
  if (!context) {
    throw new Error('useHealthAlerts must be used within a HealthAlertProvider')
  }
  return context
}

interface HealthAlertProviderProps {
  children: ReactNode
}

export function HealthAlertProvider({ children }: HealthAlertProviderProps) {
  const [alerts, setAlerts] = useState<HealthAlert[]>([])

  const addAlert = (alertData: Omit<HealthAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: HealthAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    }
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]) // Keep only last 20 alerts
  }

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ))
  }

  const clearAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const getUnacknowledgedCount = () => {
    return alerts.filter(alert => !alert.acknowledged).length
  }

  return (
    <HealthAlertContext.Provider value={{
      alerts,
      addAlert,
      acknowledgeAlert,
      clearAlert,
      getUnacknowledgedCount
    }}>
      {children}
    </HealthAlertContext.Provider>
  )
}

interface HealthAlertBadgeProps {
  className?: string
}

export function HealthAlertBadge({ className = '' }: HealthAlertBadgeProps) {
  const { getUnacknowledgedCount } = useHealthAlerts()
  const count = getUnacknowledgedCount()

  if (count === 0) return null

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      <Badge 
        variant="danger" 
        className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 text-xs flex items-center justify-center"
      >
        {count}
      </Badge>
    </div>
  )
}

interface HealthAlertPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function HealthAlertPanel({ isOpen, onClose }: HealthAlertPanelProps) {
  const { alerts, acknowledgeAlert, clearAlert } = useHealthAlerts()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Health Alerts
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No alerts at this time
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {alert.type === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex space-x-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Ack
                      </button>
                    )}
                    <button
                      onClick={() => clearAlert(alert.id)}
                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
