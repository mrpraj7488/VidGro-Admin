import React, { useState } from 'react'
import { Code, Copy, Eye, Globe, Lock, Smartphone, Server, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAdminStore } from '../../stores/adminStore'

export function ApiDocumentation() {
  const { selectedEnvironment, copyToClipboard } = useAdminStore()
  const [activeEndpoint, setActiveEndpoint] = useState('client-config')

  const baseUrl = window.location.origin
  const endpoints = [
    {
      id: 'client-config',
      name: 'Client Runtime Config',
      method: 'GET',
      path: '/api/client-runtime-config',
      description: 'Fetch public configuration for mobile clients',
      public: true,
      rateLimit: '100 requests/minute',
      authentication: 'API Key (optional)',
      parameters: [
        { name: 'env', type: 'query', required: false, description: 'Environment (production, staging, development)' },
        { name: 'x-api-key', type: 'header', required: false, description: 'Client API key for enhanced security' },
        { name: 'x-app-version', type: 'header', required: false, description: 'Mobile app version' },
        { name: 'x-env', type: 'header', required: false, description: 'Environment override' }
      ],
      response: {
        data: {
          config: {
            'SUPABASE_URL': 'https://xyz.supabase.co',
            'ADMOB_APP_ID': 'ca-app-pub-xxx',
            'FEATURE_ADS_ENABLED': 'true'
          },
          categories: {
            supabase: { 'SUPABASE_URL': 'https://xyz.supabase.co' },
            admob: { 'ADMOB_APP_ID': 'ca-app-pub-xxx' },
            features: { 'FEATURE_ADS_ENABLED': 'true' }
          },
          environment: 'production',
          timestamp: '2024-01-15T10:30:00Z',
          checksum: 'abc123def456'
        },
        cached: false,
        requestId: 'req_1234567890_abc123'
      }
    },
    {
      id: 'admin-config',
      name: 'Admin Runtime Config',
      method: 'GET',
      path: '/api/admin/runtime-config',
      description: 'Fetch all configuration (admin only)',
      public: false,
      rateLimit: '50 requests/minute',
      authentication: 'Admin Authentication Required',
      parameters: [
        { name: 'env', type: 'query', required: false, description: 'Environment filter' },
        { name: 'x-admin-email', type: 'header', required: true, description: 'Admin email for audit logging' }
      ]
    },
    {
      id: 'upsert-config',
      name: 'Create/Update Config',
      method: 'POST',
      path: '/api/admin/runtime-config',
      description: 'Create or update configuration',
      public: false,
      authentication: 'Admin Authentication Required',
      parameters: [
        { name: 'key', type: 'body', required: true, description: 'Configuration key' },
        { name: 'value', type: 'body', required: true, description: 'Configuration value' },
        { name: 'isPublic', type: 'body', required: false, description: 'Whether config is public' },
        { name: 'environment', type: 'body', required: false, description: 'Target environment' },
        { name: 'description', type: 'body', required: false, description: 'Configuration description' },
        { name: 'category', type: 'body', required: false, description: 'Configuration category' },
        { name: 'reason', type: 'body', required: false, description: 'Reason for change' }
      ]
    },
    {
      id: 'rotate-keys',
      name: 'Rotate API Keys',
      method: 'POST',
      path: '/api/admin/rotate-keys',
      description: 'Rotate multiple API keys for security',
      public: false,
      authentication: 'Admin Authentication Required',
      parameters: [
        { name: 'keys', type: 'body', required: true, description: 'Array of key names to rotate' },
        { name: 'reason', type: 'body', required: true, description: 'Reason for rotation' },
        { name: 'notifyClients', type: 'body', required: false, description: 'Send notification to mobile clients' }
      ]
    }
  ]

  const generateCurlExample = (endpoint) => {
    const headers = []
    const queryParams = []
    
    endpoint.parameters?.forEach(param => {
      if (param.type === 'header' && param.required) {
        headers.push(`-H "${param.name}: ${param.name === 'x-admin-email' ? 'admin@vidgro.com' : 'your-value'}"`)
      }
      if (param.type === 'query' && param.name === 'env') {
        queryParams.push(`env=${selectedEnvironment}`)
      }
    })

    const url = `${baseUrl}${endpoint.path}${queryParams.length ? '?' + queryParams.join('&') : ''}`
    
    if (endpoint.method === 'GET') {
      return `curl -X GET "${url}" ${headers.join(' ')}`
    } else {
      const bodyExample = endpoint.id === 'upsert-config' 
        ? '{"key": "FEATURE_NEW_FEATURE", "value": "true", "isPublic": true, "category": "features", "reason": "Enable new feature"}'
        : endpoint.id === 'rotate-keys'
        ? '{"keys": ["JWT_SECRET", "API_ENCRYPTION_KEY"], "reason": "Scheduled security rotation", "notifyClients": true}'
        : '{}'
      
      return `curl -X ${endpoint.method} "${url}" \\
  ${headers.join(' \\\n  ')} \\
  -H "Content-Type: application/json" \\
  -d '${bodyExample}'`
    }
  }

  const generateJavaScriptExample = (endpoint) => {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    endpoint.parameters?.forEach(param => {
      if (param.type === 'header' && param.required) {
        headers[param.name] = param.name === 'x-admin-email' ? 'admin@vidgro.com' : 'your-value'
      }
    })

    const queryParams = []
    endpoint.parameters?.forEach(param => {
      if (param.type === 'query' && param.name === 'env') {
        queryParams.push(`env=${selectedEnvironment}`)
      }
    })

    const url = `${baseUrl}${endpoint.path}${queryParams.length ? '?' + queryParams.join('&') : ''}`
    
    if (endpoint.method === 'GET') {
      return `const response = await fetch('${url}', {
  method: 'GET',
  headers: ${JSON.stringify(headers, null, 2)}
});

const data = await response.json();
console.log(data);`
    } else {
      const bodyExample = endpoint.id === 'upsert-config' 
        ? { key: 'FEATURE_NEW_FEATURE', value: 'true', isPublic: true, category: 'features', reason: 'Enable new feature' }
        : endpoint.id === 'rotate-keys'
        ? { keys: ['JWT_SECRET', 'API_ENCRYPTION_KEY'], reason: 'Scheduled security rotation', notifyClients: true }
        : {}
      
      return `const response = await fetch('${url}', {
  method: '${endpoint.method}',
  headers: ${JSON.stringify(headers, null, 2)},
  body: JSON.stringify(${JSON.stringify(bodyExample, null, 2)})
});

const data = await response.json();
console.log(data);`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
          API Documentation
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Complete API reference for runtime configuration endpoints
        </p>
      </div>

      {/* Environment Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Base URL:</span>
            <code className="bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded text-sm font-mono text-violet-600 dark:text-violet-400">
              {baseUrl}
            </code>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment:</span>
            <Badge variant="info" className="text-xs">{selectedEnvironment}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>Available Endpoints</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {endpoints.map((endpoint) => (
                <button
                  key={endpoint.id}
                  onClick={() => setActiveEndpoint(endpoint.id)}
                  className={`w-full text-left p-4 transition-all duration-300 ${
                    activeEndpoint === endpoint.id
                      ? 'bg-violet-500/20 border-l-4 border-violet-500'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={endpoint.method === 'GET' ? 'success' : 'info'} className="text-xs">
                        {endpoint.method}
                      </Badge>
                      {endpoint.public ? (
                        <Globe className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{endpoint.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{endpoint.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Details */}
        <div className="lg:col-span-2">
          {endpoints.filter(e => e.id === activeEndpoint).map(endpoint => (
            <div key={endpoint.id} className="space-y-6">
              {/* Endpoint Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>{endpoint.name}</span>
                    <Badge variant={endpoint.method === 'GET' ? 'success' : 'info'}>
                      {endpoint.method}
                    </Badge>
                    {endpoint.public ? (
                      <Badge variant="success" className="text-xs">Public</Badge>
                    ) : (
                      <Badge variant="warning" className="text-xs">Admin Only</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">{endpoint.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Endpoint</h4>
                      <code className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded text-sm font-mono block">
                        {endpoint.method} {endpoint.path}
                      </code>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rate Limit</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{endpoint.rateLimit}</p>
                    </div>
                  </div>

                  {endpoint.parameters && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Parameters</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <code className="text-sm font-mono text-violet-600 dark:text-violet-400">
                                {param.name}
                              </code>
                              <Badge variant="default" className="text-xs">{param.type}</Badge>
                              {param.required && (
                                <Badge variant="danger" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-right max-w-xs">
                              {param.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Code Examples */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Code Examples</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateCurlExample(endpoint))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy cURL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateJavaScriptExample(endpoint))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy JS
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* cURL Example */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <span>cURL</span>
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                        {generateCurlExample(endpoint)}
                      </pre>
                    </div>
                  </div>

                  {/* JavaScript Example */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">JavaScript</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-blue-400 text-sm font-mono whitespace-pre-wrap">
                        {generateJavaScriptExample(endpoint)}
                      </pre>
                    </div>
                  </div>

                  {/* Response Example */}
                  {endpoint.response && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Response Example</h4>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-yellow-400 text-sm font-mono whitespace-pre-wrap">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Notes */}
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
                    <Lock className="w-5 h-5" />
                    <span>Security Considerations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-orange-800 dark:text-orange-200">
                    {endpoint.public ? (
                      <>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>This endpoint only returns public configuration values</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>Rate limited to prevent abuse</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>Cached responses for performance</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>Includes checksum for integrity verification</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start space-x-2">
                          <Lock className="w-4 h-4 text-orange-600 mt-0.5" />
                          <span>Requires admin authentication</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Lock className="w-4 h-4 text-orange-600 mt-0.5" />
                          <span>All actions are logged for audit purposes</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Lock className="w-4 h-4 text-orange-600 mt-0.5" />
                          <span>IP address and user agent tracking</span>
                        </div>
                        {endpoint.id === 'rotate-keys' && (
                          <div className="flex items-start space-x-2">
                            <Lock className="w-4 h-4 text-orange-600 mt-0.5" />
                            <span>Critical keys cannot be deleted, only rotated</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Mobile App Integration Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Step 1: Fetch Configuration on App Start
              </h4>
              <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                <pre className="text-blue-400 text-sm font-mono">
{`// React Native / Expo example
const fetchAppConfig = async () => {
  try {
    const response = await fetch('${baseUrl}/api/client-runtime-config?env=${selectedEnvironment}', {
      headers: {
        'x-app-version': '1.0.0',
        'x-api-key': 'your-api-key' // Optional
      }
    });
    
    const result = await response.json();
    const config = result.data.config;
    
    // Store config in app state or AsyncStorage
    await AsyncStorage.setItem('app_config', JSON.stringify(config));
    
    return config;
  } catch (error) {
    console.error('Failed to fetch config:', error);
    // Use cached config or defaults
  }
};`}
                </pre>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                Step 2: Use Configuration in Your App
              </h4>
              <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                <pre className="text-emerald-400 text-sm font-mono">
{`// Example usage in React Native
const useAppConfig = () => {
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = async () => {
    const stored = await AsyncStorage.getItem('app_config');
    if (stored) {
      setConfig(JSON.parse(stored));
    }
  };
  
  return config;
};

// In your component
const MyComponent = () => {
  const config = useAppConfig();
  
  const showAds = config?.FEATURE_ADS_ENABLED === 'true';
  const supabaseUrl = config?.SUPABASE_URL;
  
  return (
    <View>
      {showAds && <AdBanner />}
      {/* Your app content */}
    </View>
  );
};`}
                </pre>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
                Step 3: Handle Configuration Updates
              </h4>
              <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                <pre className="text-orange-400 text-sm font-mono">
{`// Periodic config refresh
const refreshConfig = async () => {
  try {
    const response = await fetch('${baseUrl}/api/client-runtime-config?env=${selectedEnvironment}');
    const result = await response.json();
    
    // Check if config changed using checksum
    const stored = await AsyncStorage.getItem('app_config_checksum');
    if (stored !== result.data.checksum) {
      // Config changed, update local storage
      await AsyncStorage.setItem('app_config', JSON.stringify(result.data.config));
      await AsyncStorage.setItem('app_config_checksum', result.data.checksum);
      
      // Optionally restart app or reload components
      console.log('Configuration updated');
    }
  } catch (error) {
    console.error('Config refresh failed:', error);
  }
};

// Call refreshConfig() periodically or on app foreground`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}