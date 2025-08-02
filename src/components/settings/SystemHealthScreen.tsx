import React, { useState, useEffect } from 'react'
import { Activity, Database, Smartphone, Globe, Server, CheckCircle, AlertTriangle, XCircle, RefreshCw, Wifi, HardDrive, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface HealthCheck {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'error' | 'checking'
  responseTime?: number
  lastChecked: string
  details?: string
  icon: React.ComponentType<any>
}

export function SystemHealthScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      id: 'database',
      name: 'Database Connection',
      status: 'healthy',
      responseTime: 45,
      lastChecked: new Date().toISOString(),
      details: 'Supabase connection active',
      icon: Database
    },
    {
      id: 'mobile_app',
      name: 'Mobile App API',
      status: 'healthy',
      responseTime: 120,
      lastChecked: new Date().toISOString(),
      details: 'All endpoints responding',
      icon: Smartphone
    },
    {
      id: 'cdn',
      name: 'CDN Service',
      status: 'warning',
      responseTime: 250,
      lastChecked: new Date().toISOString(),
      details: 'Slower than usual response',
      icon: Globe
    },
    {
      id: 'email_service',
      name: 'Email Service',
      status: 'healthy',
      responseTime: 80,
      lastChecked: new Date().toISOString(),
      details: 'SMTP server operational',
      icon: Server
    },
    {
      id: 'storage',
      name: 'File Storage',
      status: 'healthy',
      responseTime: 35,
      lastChecked: new Date().toISOString(),
      details: '85% capacity remaining',
      icon: HardDrive
    },
    {
      id: 'cpu',
      name: 'Server Performance',
      status: 'warning',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      details: 'CPU usage at 78%',
      icon: Cpu
    }
  ])

  const runHealthCheck = async (checkId?: string) => {
    setIsRefreshing(true)
    
    // Update specific check or all checks to 'checking' status
    setHealthChecks(prev => prev.map(check => 
      (!checkId || check.id === checkId) 
        ? { ...check, status: 'checking' as const }
        : check
    ))

    // Simulate health check delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update with random results for demo
    setHealthChecks(prev => prev.map(check => {
      if (checkId && check.id !== checkId) return check
      
      const statuses: ('healthy' | 'warning' | 'error')[] = ['healthy', 'healthy', 'healthy', 'warning', 'error']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      return {
        ...check,
        status: randomStatus,
        responseTime: Math.floor(Math.random() * 300) + 20,
        lastChecked: new Date().toISOString(),
        details: randomStatus === 'healthy' ? 'All systems operational' :
                randomStatus === 'warning' ? 'Minor issues detected' :
                'Service unavailable'
      }
    }))

    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>
      case 'warning':
        return <Badge variant="warning">Warning</Badge>
      case 'error':
        return <Badge variant="danger">Error</Badge>
      case 'checking':
        return <Badge variant="info">Checking</Badge>
      default:
        return <Badge variant="default">Unknown</Badge>
    }
  }

  const overallHealth = healthChecks.every(check => check.status === 'healthy') ? 'healthy' :
                       healthChecks.some(check => check.status === 'error') ? 'error' : 'warning'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            System Health Monitor
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor the health of all integrated services
          </p>
        </div>
        <Button 
          onClick={() => runHealthCheck()}
          disabled={isRefreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh All</span>
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`gaming-card-enhanced border-2 ${
        overallHealth === 'healthy' ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20' :
        overallHealth === 'error' ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/20' :
        'border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                overallHealth === 'healthy' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
                overallHealth === 'error' ? 'bg-red-100 dark:bg-red-900/50' :
                'bg-orange-100 dark:bg-orange-900/50'
              }`}>
                {getStatusIcon(overallHealth)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  System Status: {overallHealth === 'healthy' ? 'All Systems Operational' :
                                 overallHealth === 'error' ? 'Critical Issues Detected' :
                                 'Minor Issues Detected'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthChecks.filter(check => check.status === 'healthy').length}/{healthChecks.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Services Healthy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthChecks.map((check) => {
          const Icon = check.icon
          return (
            <Card key={check.id} className="gaming-card-enhanced">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{check.name}</h4>
                      {check.responseTime !== undefined && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {check.responseTime}ms response
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusIcon(check.status)}
                </div>

                <div className="space-y-3">
                  {getStatusBadge(check.status)}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {check.details}
                  </p>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last checked: {new Date(check.lastChecked).toLocaleTimeString()}
                  </p>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runHealthCheck(check.id)}
                    disabled={check.status === 'checking'}
                    className="w-full"
                  >
                    {check.status === 'checking' ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Check Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="w-5 h-5" />
              <span>Server Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5" />
              <span>Network Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Bandwidth Usage</span>
                <span className="text-sm font-medium">2.4 GB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Connections</span>
                <span className="text-sm font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Latency</span>
                <span className="text-sm font-medium">45ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">120ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Requests/min</span>
                <span className="text-sm font-medium">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cache Hit Rate</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">94.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}