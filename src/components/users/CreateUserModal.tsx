import React, { useState } from 'react'
import { X, User, Mail, Lock, Crown, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (userData: any) => Promise<void>
}

export function CreateUserModal({ isOpen, onClose, onCreateUser }: CreateUserModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    initialCoins: 0,
    isVip: false,
    sendWelcomeEmail: true
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onCreateUser(formData)
      setFormData({
        username: '',
        email: '',
        password: '',
        initialCoins: 0,
        isVip: false,
        sendWelcomeEmail: true
      })
      onClose()
    } catch (error) {
      console.error('Failed to create user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Dispatch popup state events
  React.useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
    }
    return () => {
      if (isOpen) {
        window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: false } }))
      }
    }
  }, [isOpen])
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="gaming-modal max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New User</h2>
              <p className="text-sm text-gray-400">Add a new user to the platform</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username *
            </label>
            <Input
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              required
              className="!bg-violet-500/10"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
              className="!bg-violet-500/10"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                required
                className="!bg-violet-500/10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Initial Coins */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initial Coins
            </label>
            <Input
              type="number"
              min="0"
              value={formData.initialCoins}
              onChange={(e) => handleInputChange('initialCoins', Number(e.target.value))}
              placeholder="Enter initial coin amount"
              className="!bg-violet-500/10"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 gaming-card">
              <div>
                <h4 className="font-medium text-white flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>VIP Status</span>
                </h4>
                <p className="text-sm text-gray-400">Grant VIP privileges to this user</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleInputChange('isVip', !formData.isVip)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                    formData.isVip
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                      : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      formData.isVip ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 gaming-card">
              <div>
                <h4 className="font-medium text-white flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Welcome Email</span>
                </h4>
                <p className="text-sm text-gray-400">Send welcome email to new user</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleInputChange('sendWelcomeEmail', !formData.sendWelcomeEmail)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                    formData.sendWelcomeEmail
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                      : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      formData.sendWelcomeEmail ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-violet-500/20">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
