import React, { useState, useEffect } from 'react'
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Server, Database, Globe, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface HealthCheck {
  id: string
  name: string
  description: string
  status: 'healthy' | 'warning' | 'error' | 'checking'
  details?: string
  lastChecked: string
  responseTime?: number
  category: 'database' | 'api' | 'external' | 'system'
}

interface SystemMetrics {
  uptime: number
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
  errorRate: number
  lastUpdated: string
}

export function SystemHealthScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHealthChecks()
    loadSystemMetrics()
  }, [])

  const loadHealthChecks = async () => {
    try {
      const checks = await fetchSystemHealthChecks()
      setHealthChecks(checks)
    } catch (error) {
      console.error('Failed to load health checks:', error)
      setHealthChecks([])
    }
  }

  const loadSystemMetrics = async () => {
    try {
      const metrics = await fetchSystemMetrics()
      setSystemMetrics(metrics)
    } catch (error) {
      console.error('Failed to load system metrics:', error)
      setSystemMetrics(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSystemHealthChecks = async (): Promise<HealthCheck[]> => {
    try {
      const response = await fetch('/api/admin/system-health')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
    
    return [] // Return empty array if API is not available
  }

  const fetchSystemMetrics = async (): Promise<SystemMetrics | null> => {
    try {
      const response = await fetch('/api/admin/system-metrics')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error)
    }
    
    return null
  }

  const runHealthCheck = async (checkId?: string) => {
    setIsRefreshing(true)
    
    // Update specific check or all checks to 'checking' status
    setHealthChecks(prev => prev.map(check => 
      (!checkId || check.id === checkId) 
        ? { ...check, status: 'checking' as const }
        : check
    ))

    try {
      // Run actual health checks
      const checksToRun = checkId ? healthChecks.filter(c => c.id === checkId) : healthChecks
      
      for (const check of checksToRun) {
        const startTime = Date.now()
        let status: 'healthy' | 'warning' | 'error' = 'healthy'
        let details = ''
        let responseTime = 0

        try {
          switch (check.id) {
            case 'database':
              // Test database connection
              const dbResponse = await fetch('/api/admin/test-database')
              if (!dbResponse.ok) throw new Error(`Database test failed: ${dbResponse.status}`)
              const dbData = await dbResponse.json()
              status = dbData.healthy ? 'healthy' : 'error'
              details = dbData.message || 'Database connection successful'
              break

            case 'api-server':
              // Test API server response
              const apiResponse = await fetch('/health')
              if (!apiResponse.ok) throw new Error(`API test failed: ${apiResponse.status}`)
              const apiData = await apiResponse.json()
              status = apiData.status === 'healthy' ? 'healthy' : 'error'
              details = `API server responding in ${Date.now() - startTime}ms`
              break

            case 'external-services':
              // Test external service connectivity
              const extResponse = await fetch('/api/admin/test-external-services')
              if (!extResponse.ok) throw new Error(`External services test failed: ${extResponse.status}`)
              const extData = await extResponse.json()
              status = extData.healthy ? 'healthy' : 'warning'
              details = extData.message || 'External services accessible'
              break

            case 'system-resources':
              // Test system resource availability
              const sysResponse = await fetch('/api/admin/system-resources')
              if (!sysResponse.ok) throw new Error(`System resources test failed: ${sysResponse.status}`)
              const sysData = await sysResponse.json()
              status = sysData.healthy ? 'healthy' : 'warning'
              details = `CPU: ${sysData.cpu}%, Memory: ${sysData.memory}%`
              break

            default:
              status = 'error'
              details = 'Unknown health check type'
          }

          responseTime = Date.now() - startTime
        } catch (error) {
          status = 'error'
          details = error instanceof Error ? error.message : 'Health check failed'
        }

        // Update the check with results
        setHealthChecks(prev => prev.map(c => 
          c.id === check.id 
            ? { 
                ...c, 
                status, 
                details, 
                responseTime,
                lastChecked: new Date().toISOString()
              }
            : c
        ))
      }
    } catch (error) {
      console.error('Health check failed:', error)
      // Set failed checks to error status
      setHealthChecks(prev => prev.map(check => 
        (!checkId || check.id === checkId) 
          ? { 
              ...check, 
              status: 'error' as const, 
              details: 'Health check failed' 
            }
          : check
      ))
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'checking':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="w-4 h-4" />
      case 'api':
        return <Server className="w-4 h-4" />
      case 'external':
        return <Globe className="w-4 h-4" />
      case 'system':
        return <Shield className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            System Health
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor system performance and service health
          </p>
        </div>
        <Button 
          onClick={() => runHealthCheck()}
          disabled={isRefreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Checking...' : 'Run Health Check'}</span>
        </Button>
      </div>

      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gaming-card-enhanced">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemMetrics.uptime.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card-enhanced">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemMetrics.cpuUsage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card-enhanced">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Memory</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemMetrics.memoryUsage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card-enhanced">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connections</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemMetrics.activeConnections}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Checks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Service Health Checks
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthChecks.map((check) => (
            <Card key={check.id} className="gaming-card-enhanced">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(check.category)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {check.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {check.description}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(check.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <Badge 
                      variant={check.status === 'healthy' ? 'success' : 
                              check.status === 'warning' ? 'warning' : 
                              check.status === 'error' ? 'danger' : 'default'}
                    >
                      {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                    </Badge>
                  </div>

                  {check.responseTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Response Time</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {check.responseTime}ms
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Checked</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(check.lastChecked).toLocaleTimeString()}
                    </span>
                  </div>

                  {check.details && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {check.details}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => runHealthCheck(check.id)}
                    disabled={isRefreshing}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Recheck
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Health Summary */}
      <Card className="gaming-card-enhanced border-2 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-5 h-5" />
            <span>System Health Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {healthChecks.filter(c => c.status === 'healthy').length}
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">Healthy Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {healthChecks.filter(c => c.status === 'warning').length}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {healthChecks.filter(c => c.status === 'error').length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
