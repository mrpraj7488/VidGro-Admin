import React, { useState, useEffect } from 'react'
import { Code, Copy, Check, ExternalLink, BookOpen, Zap, Shield, Database, Smartphone, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface ApiEndpoint {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  parameters?: ApiParameter[]
  responses?: ApiResponse[]
  rateLimit?: string
  authentication?: string
  category: string
  status: 'active' | 'deprecated' | 'beta'
}

interface ApiParameter {
  name: string
  type: string
  required: boolean
  description: string
  example?: string
}

interface ApiResponse {
  code: number
  description: string
  example?: string
}

interface ApiCategory {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  endpoints: ApiEndpoint[]
}

export function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadApiDocumentation()
  }, [])

  const loadApiDocumentation = async () => {
    try {
      setIsLoading(true)
      const categories = await fetchApiDocumentation()
      setApiCategories(categories)
    } catch (error) {
      console.error('Failed to load API documentation:', error)
      setApiCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchApiDocumentation = async (): Promise<ApiCategory[]> => {
    try {
      // Fetch actual API documentation from your backend
      const response = await fetch('/api/admin/api-documentation')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch API documentation:', error)
    }
    
    // Return actual API endpoints based on your backend implementation
    return [
      {
        id: 'client',
        name: 'Client Runtime Configuration',
        description: 'Endpoints for mobile app runtime configuration',
        icon: Smartphone,
        endpoints: [
          {
            id: 'client-config',
            name: 'Get Runtime Configuration',
            method: 'GET',
            path: '/api/client-runtime-config',
            description: 'Retrieve runtime configuration for mobile app including Supabase credentials, feature flags, and security settings',
            parameters: [
              {
                name: 'User-Agent',
                type: 'string',
                required: true,
                description: 'Mobile app user agent string'
              },
              {
                name: 'X-App-Version',
                type: 'string',
                required: true,
                description: 'Mobile app version'
              },
              {
                name: 'X-Platform',
                type: 'string',
                required: true,
                description: 'Platform (ios/android)'
              }
            ],
            responses: [
              {
                code: 200,
                description: 'Runtime configuration retrieved successfully',
                example: '{"data": {"supabase": {...}, "features": {...}}}'
              },
              {
                code: 400,
                description: 'Invalid request headers'
              },
              {
                code: 429,
                description: 'Rate limit exceeded'
              }
            ],
            rateLimit: '100 requests per minute',
            authentication: 'None (public endpoint)',
            category: 'client',
            status: 'active'
          }
        ]
      },
      {
        id: 'admin',
        name: 'Admin Panel',
        description: 'Administrative endpoints for platform management',
        icon: Shield,
        endpoints: [
          {
            id: 'health-check',
            name: 'Health Check',
            method: 'GET',
            path: '/health',
            description: 'Check system health and status',
            responses: [
              {
                code: 200,
                description: 'System is healthy',
                example: '{"status": "healthy", "timestamp": "..."}'
              }
            ],
            category: 'admin',
            status: 'active'
          },
          {
            id: 'system-health',
            name: 'System Health',
            method: 'GET',
            path: '/api/admin/system-health',
            description: 'Get detailed system health metrics',
            authentication: 'Admin authentication required',
            category: 'admin',
            status: 'active'
          },
          {
            id: 'system-metrics',
            name: 'System Metrics',
            method: 'GET',
            path: '/api/admin/system-metrics',
            description: 'Get system performance metrics',
            authentication: 'Admin authentication required',
            category: 'admin',
            status: 'active'
          }
        ]
      },
      {
        id: 'user-management',
        name: 'User Management',
        description: 'User administration and management endpoints',
        icon: Database,
        endpoints: [
          {
            id: 'fetch-users',
            name: 'Fetch Users',
            method: 'GET',
            path: '/api/admin/users',
            description: 'Retrieve user list with filtering and pagination',
            authentication: 'Admin authentication required',
            category: 'user-management',
            status: 'active'
          },
          {
            id: 'update-user',
            name: 'Update User',
            method: 'PUT',
            path: '/api/admin/users/:id',
            description: 'Update user information',
            authentication: 'Admin authentication required',
            category: 'user-management',
            status: 'active'
          },
          {
            id: 'ban-user',
            name: 'Ban User',
            method: 'POST',
            path: '/api/admin/users/:id/ban',
            description: 'Ban a user account',
            authentication: 'Admin authentication required',
            category: 'user-management',
            status: 'active'
          }
        ]
      },
      {
        id: 'video-management',
        name: 'Video Management',
        description: 'Video moderation and management endpoints',
        icon: Globe,
        endpoints: [
          {
            id: 'fetch-videos',
            name: 'Fetch Videos',
            method: 'GET',
            path: '/api/admin/videos',
            description: 'Retrieve video list with filtering',
            authentication: 'Admin authentication required',
            category: 'video-management',
            status: 'active'
          },
          {
            id: 'approve-video',
            name: 'Approve Video',
            method: 'POST',
            path: '/api/admin/videos/:id/approve',
            description: 'Approve a pending video',
            authentication: 'Admin authentication required',
            category: 'video-management',
            status: 'active'
          },
          {
            id: 'reject-video',
            name: 'Reject Video',
            method: 'POST',
            path: '/api/admin/videos/:id/reject',
            description: 'Reject a pending video',
            authentication: 'Admin authentication required',
            category: 'video-management',
            status: 'active'
          }
        ]
      },
      {
        id: 'bug-reports',
        name: 'Bug Reports',
        description: 'Bug report management and tracking',
        icon: Code,
        endpoints: [
          {
            id: 'submit-bug-report',
            name: 'Submit Bug Report',
            method: 'POST',
            path: '/api/bug-report',
            description: 'Submit a new bug report from mobile app',
            parameters: [
              {
                name: 'title',
                type: 'string',
                required: true,
                description: 'Bug report title'
              },
              {
                name: 'description',
                type: 'string',
                required: true,
                description: 'Detailed bug description'
              },
              {
                name: 'category',
                type: 'string',
                required: true,
                description: 'Bug category'
              }
            ],
            responses: [
              {
                code: 201,
                description: 'Bug report submitted successfully'
              },
              {
                code: 400,
                description: 'Invalid request data'
              }
            ],
            category: 'bug-reports',
            status: 'active'
          },
          {
            id: 'fetch-bug-reports',
            name: 'Fetch Bug Reports',
            method: 'GET',
            path: '/api/admin/bug-reports',
            description: 'Retrieve bug reports for admin review',
            authentication: 'Admin authentication required',
            category: 'bug-reports',
            status: 'active'
          }
        ]
      }
    ]
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'PUT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'deprecated':
        return <Badge variant="danger">Deprecated</Badge>
      case 'beta':
        return <Badge variant="warning">Beta</Badge>
      default:
        return <Badge variant="default">Unknown</Badge>
    }
  }

  const filteredCategories = apiCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.endpoints.some(endpoint =>
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

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
            API Documentation
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Complete reference for all available API endpoints
          </p>
        </div>
        <Button 
          onClick={() => loadApiDocumentation()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>Refresh Docs</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search endpoints, methods, or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Endpoints</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {apiCategories.reduce((total, cat) => total + cat.endpoints.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active APIs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {apiCategories.reduce((total, cat) => 
                    total + cat.endpoints.filter(ep => ep.status === 'active').length, 0
                  )}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {apiCategories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Public APIs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {apiCategories.reduce((total, cat) => 
                    total + cat.endpoints.filter(ep => ep.authentication === 'None (public endpoint)').length, 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Categories */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.id} className="gaming-card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.endpoints.map((endpoint) => (
                      <div key={endpoint.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {endpoint.path}
                            </code>
                            {getStatusBadge(endpoint.status)}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {endpoint.description}
                        </p>

                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Parameters
                            </h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param) => (
                                <div key={param.name} className="flex items-center space-x-3 text-sm">
                                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {param.name}
                                  </code>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {param.type}
                                  </span>
                                  {param.required && (
                                    <Badge variant="danger" className="text-xs">Required</Badge>
                                  )}
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {param.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {endpoint.responses && endpoint.responses.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Responses
                            </h4>
                            <div className="space-y-2">
                              {endpoint.responses.map((response) => (
                                <div key={response.code} className="flex items-center space-x-3 text-sm">
                                  <Badge variant={response.code >= 400 ? 'danger' : 'success'}>
                                    {response.code}
                                  </Badge>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {response.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {endpoint.rateLimit && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Rate Limit: {endpoint.rateLimit}
                          </div>
                        )}

                        {endpoint.authentication && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Authentication: {endpoint.authentication}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No API endpoints found' : 'No API Documentation Available'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm 
                ? `No endpoints match "${searchTerm}". Try a different search term.`
                : 'API documentation will be loaded from your backend system'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => loadApiDocumentation()} variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Load Documentation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      <Card className="gaming-card-enhanced border-2 border-violet-500/50 bg-violet-50/50 dark:bg-violet-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-violet-700 dark:text-violet-300">
            <Zap className="w-5 h-5" />
            <span>Getting Started</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-violet-700 dark:text-violet-300">
              To use these APIs, you'll need to authenticate your requests with your API key for protected endpoints.
            </p>
            <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-lg">
              <p className="text-sm text-violet-800 dark:text-violet-200 font-mono">
                Authorization: Bearer YOUR_API_KEY
              </p>
            </div>
            <p className="text-sm text-violet-600 dark:text-violet-400">
              Replace YOUR_API_KEY with your actual API key from your account settings. Public endpoints like health checks and client configuration do not require authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
