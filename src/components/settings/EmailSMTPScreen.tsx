import React, { useState } from 'react'
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
    host: 'smtp.gmail.com',
    port: 587,
    username: 'admin@vidgro.com',
    password: '',
    encryption: 'tls',
    fromName: 'VidGro Admin',
    fromEmail: 'noreply@vidgro.com',
    replyTo: 'support@vidgro.com'
  })

  const handleInputChange = (field: string, value: string | number) => {
    setSmtpConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus('idle')
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Random success/failure for demo
    const success = Math.random() > 0.3
    setConnectionStatus(success ? 'success' : 'error')
    setIsTestingConnection(false)
  }

  const handleSaveConfig = async () => {
    // TODO: Implement save functionality
    console.log('Saving SMTP config:', smtpConfig)
  }

  const handleSendTestEmail = async () => {
    // TODO: Implement test email functionality
    console.log('Sending test email')
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
                placeholder="smtp.gmail.com"
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
                placeholder="your-email@gmail.com"
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
                placeholder="VidGro Admin"
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
                placeholder="noreply@vidgro.com"
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
                placeholder="support@vidgro.com"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Welcome Email', status: 'active', lastModified: '2 days ago' },
              { name: 'Password Reset', status: 'active', lastModified: '1 week ago' },
              { name: 'VIP Upgrade', status: 'active', lastModified: '3 days ago' },
              { name: 'Coin Purchase', status: 'active', lastModified: '5 days ago' },
              { name: 'Video Approved', status: 'draft', lastModified: '1 day ago' },
              { name: 'Account Suspended', status: 'draft', lastModified: '1 week ago' }
            ].map((template, index) => (
              <div key={index} className="p-4 gaming-card hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                  <Badge variant={template.status === 'active' ? 'success' : 'default'}>
                    {template.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modified {template.lastModified}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Edit Template
                </Button>
              </div>
            ))}
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