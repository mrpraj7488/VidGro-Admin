import React, { useState, useEffect } from 'react'
import { Mail, Server, Lock, Eye, EyeOff, Send, CheckCircle, AlertTriangle, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'

export function EmailSMTPScreen() {
  const [showPassword, setShowPassword] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 0,
    username: '',
    password: '',
    encryption: '',
    fromName: '',
    fromEmail: '',
    replyTo: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSmtpConfig()
  }, [])

  const loadSmtpConfig = async () => {
    setIsLoading(true)
    try {
      // Load SMTP configuration from database or environment
      const config = await fetchSmtpConfig()
      if (config) {
        setSmtpConfig(config)
      }
    } catch (error) {
      console.error('Failed to load SMTP config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSmtpConfig = async () => {
    // SMTP configuration API call will be implemented when backend is ready
    // This should fetch from your database or configuration service
    try {
      // Placeholder for actual implementation
      const response = await fetch('/api/admin/smtp-config')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch SMTP config:', error)
    }
    
    // Return empty config if no data available
    return {
      host: '',
      port: 0,
      username: '',
      password: '',
      encryption: '',
      fromName: '',
      fromEmail: '',
      replyTo: ''
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setSmtpConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus('idle')
    
    try {
      // SMTP connection test will be implemented when backend is ready
      // This would typically involve creating a test connection to the SMTP server
      // and attempting to send a test email
      
      // For now, show a placeholder message
      setConnectionStatus('error')
      alert('SMTP connection testing not yet implemented. Please configure your SMTP settings manually.')
    } catch (error) {
      console.error('SMTP connection test failed:', error)
      setConnectionStatus('error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      // Save functionality will be implemented when backend is ready
      // This should save to your database or configuration service
      const response = await fetch('/api/admin/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpConfig)
      })
      
      if (response.ok) {
        alert('SMTP configuration saved successfully')
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Failed to save SMTP config:', error)
      alert('Failed to save SMTP configuration')
    }
  }

  const handleSendTestEmail = async () => {
    try {
      // Test email functionality will be implemented when backend is ready
      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpConfig)
      })
      
      if (response.ok) {
        alert('Test email sent successfully')
      } else {
        throw new Error('Failed to send test email')
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      alert('Failed to send test email')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
          Email SMTP Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Configure email server settings for system notifications
        </p>
      </div>

      {/* Connection Status */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                connectionStatus === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                connectionStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-gray-100 dark:bg-gray-800'
              }`}>
                {connectionStatus === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : connectionStatus === 'error' ? (
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                ) : (
                  <Server className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">SMTP Connection Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {connectionStatus === 'success' ? 'Connected successfully' :
                   connectionStatus === 'error' ? 'Connection failed' :
                   'Not tested yet'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <Server className="w-4 h-4 mr-2 animate-pulse" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              {connectionStatus === 'success' && (
                <Button onClick={handleSendTestEmail}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>SMTP Server Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMTP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Host *
              </label>
              <Input
                value={smtpConfig.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                placeholder="Enter SMTP host (e.g., smtp.gmail.com)"
                required
              />
            </div>

            {/* SMTP Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Port *
              </label>
              <Input
                type="number"
                value={smtpConfig.port}
                onChange={(e) => handleInputChange('port', Number(e.target.value))}
                placeholder="587"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username *
              </label>
              <Input
                value={smtpConfig.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your email username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={smtpConfig.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password or app password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Encryption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Encryption
              </label>
              <select
                value={smtpConfig.encryption}
                onChange={(e) => handleInputChange('encryption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
              >
                <option value="none">None</option>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Name
              </label>
              <Input
                value={smtpConfig.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                placeholder="Enter sender name"
              />
            </div>

            {/* From Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Email
              </label>
              <Input
                type="email"
                value={smtpConfig.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                placeholder="Enter sender email address"
              />
            </div>

            {/* Reply To */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reply To Email
              </label>
              <Input
                type="email"
                value={smtpConfig.replyTo}
                onChange={(e) => handleInputChange('replyTo', e.target.value)}
                placeholder="Enter reply-to email address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Email templates will be loaded from your configuration system</p>
            <p className="text-sm">No templates available yet</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </Button>
      </div>
    </div>
  )
}
