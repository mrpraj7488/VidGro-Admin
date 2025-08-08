import React, { useState, useEffect } from 'react'
import { Shield, Key, AlertTriangle, CheckCircle, Clock, Eye, RefreshCw, Lock, Globe, Database, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAdminStore } from '../../stores/adminStore'
import { format, formatDistanceToNow } from 'date-fns'

interface SecurityEvent {
  id: string
  type: 'key_rotation' | 'config_change' | 'access_attempt' | 'permission_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: string
  adminEmail?: string
  ipAddress?: string
  resolved: boolean
}

export function SecurityDashboard() {
  const { runtimeConfig, configAuditLogs, fetchConfigAuditLogs, selectedEnvironment } = useAdminStore()
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSecurityEvents()
    fetchConfigAuditLogs(undefined, selectedEnvironment)
  }, [selectedEnvironment])

  const fetchSecurityEvents = async () => {
    setIsLoading(true)
    // Mock security events - in real app, this would come from security monitoring
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'key_rotation',
        severity: 'medium',
        description: 'JWT secret key rotated successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        adminEmail: 'admin@vidgro.com',
        resolved: true
      },
      {
        id: '2',
        type: 'access_attempt',
        severity: 'high',
        description: 'Multiple failed API key validation attempts detected',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.100',
        resolved: false
      },
      {
        id: '3',
        type: 'config_change',
        severity: 'low',
        description: 'Feature flag FEATURE_ADS_ENABLED updated',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        adminEmail: 'admin@vidgro.com',
        resolved: true
      }
    ]
    
    setSecurityEvents(mockEvents)
    setIsLoading(false)
  }

  const getSecurityMetrics = () => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const secretKeys = runtimeConfig.filter(c => 
      c.key.toLowerCase().includes('key') || 
      c.key.toLowerCase().includes('secret') || 
      c.key.toLowerCase().includes('password')
    )

    const oldKeys = secretKeys.filter(c => new Date(c.updatedAt) < ninetyDaysAgo)
    const recentChanges = configAuditLogs.filter(log => new Date(log.timestamp) > thirtyDaysAgo)

    return {
      totalSecrets: secretKeys.length,
      oldSecrets: oldKeys.length,
      publicConfigs: runtimeConfig.filter(c => c.isPublic).length,
      privateConfigs: runtimeConfig.filter(c => !c.isPublic).length,
      recentChanges: recentChanges.length,
      securityScore: Math.max(0, 100 - (oldKeys.length * 10) - (securityEvents.filter(e => !e.resolved).length * 5))
    }
  }

  const metrics = getSecurityMetrics()

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="danger">Critical</Badge>
      case 'high': return <Badge variant="danger">High</Badge>
      case 'medium': return <Badge variant="warning">Medium</Badge>
      case 'low': return <Badge variant="info">Low</Badge>
      default: return <Badge variant="default">{severity}</Badge>
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'key_rotation': return <Key className="w-4 h-4" />
      case 'config_change': return <Settings className="w-4 h-4" />
      case 'access_attempt': return <Eye className="w-4 h-4" />
      case 'permission_change': return <Shield className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Security Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor configuration security and access patterns
          </p>
        </div>
        <Button onClick={fetchSecurityEvents} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Score */}
      <Card className={`gaming-card-enhanced ${
        metrics.securityScore >= 90 ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20' :
        metrics.securityScore >= 70 ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20' :
        'border-red-500/50 bg-red-50/50 dark:bg-red-900/20'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                metrics.securityScore >= 90 ? 'bg-emerald-100 dark:bg-emerald-900/50' :
                metrics.securityScore >= 70 ? 'bg-orange-100 dark:bg-orange-900/50' :
                'bg-red-100 dark:bg-red-900/50'
              }`}>
                <Shield className={`w-8 h-8 ${
                  metrics.securityScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                  metrics.securityScore >= 70 ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Security Score: {metrics.securityScore}/100
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {metrics.securityScore >= 90 ? 'Excellent security posture' :
                   metrics.securityScore >= 70 ? 'Good security with room for improvement' :
                   'Security improvements needed'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <div>Last scan: {format(new Date(), 'HH:mm:ss')}</div>
                <div>{metrics.oldSecrets} keys need rotation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {metrics.totalSecrets}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Secret Keys</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.publicConfigs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Public Configs</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {metrics.privateConfigs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Private Configs</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.recentChanges}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recent Changes</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Security Events</span>
            <Badge variant="info" className="text-xs">
              {securityEvents.filter(e => !e.resolved).length} unresolved
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-4 p-4 gaming-card">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                    event.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    event.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getSeverityBadge(event.severity)}
                      {event.resolved ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.description}</p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-x-4">
                      <span>{formatDistanceToNow(new Date(event.timestamp))} ago</span>
                      {event.adminEmail && <span>by {event.adminEmail}</span>}
                      {event.ipAddress && <span>from {event.ipAddress}</span>}
                    </div>
                  </div>
                </div>
                {!event.resolved && (
                  <Button variant="outline" size="sm">
                    Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Rotation Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Key Rotation Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {runtimeConfig
              .filter(c => c.key.toLowerCase().includes('key') || c.key.toLowerCase().includes('secret'))
              .map((config) => {
                const daysSinceUpdate = Math.floor(
                  (Date.now() - new Date(config.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                )
                const needsRotation = daysSinceUpdate > 90
                
                return (
                  <div key={config.key} className="flex items-center justify-between p-4 gaming-card">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        needsRotation ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                      }`}>
                        <Key className={`w-4 h-4 ${
                          needsRotation ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`} />
                      </div>
                      <div>
                        <code className="text-sm font-mono text-violet-600 dark:text-violet-400">
                          {config.key}
                        </code>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last rotated {daysSinceUpdate} days ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {needsRotation ? (
                        <Badge variant="danger" className="text-xs">
                          Needs Rotation
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">
                          Up to Date
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        Rotate Now
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}