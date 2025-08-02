import React, { useState } from 'react'
import { X, Send, Users, Crown, Bell, MessageSquare } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

interface BulkNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (notification: {
    title: string
    message: string
    targetUsers: 'all' | 'vip' | 'regular'
    type: 'push' | 'email' | 'both'
  }) => Promise<void>
}

export function BulkNotificationModal({ isOpen, onClose, onSend }: BulkNotificationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetUsers: 'all' as 'all' | 'vip' | 'regular',
    type: 'push' as 'push' | 'email' | 'both'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) return

    setIsLoading(true)
    try {
      await onSend(formData)
      setFormData({
        title: '',
        message: '',
        targetUsers: 'all',
        type: 'push'
      })
      onClose()
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const getTargetUserCount = () => {
    // Mock counts - in real app, get from store
    const counts = { all: 45732, vip: 3247, regular: 42485 }
    return counts[formData.targetUsers]
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="gaming-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Send Bulk Notification</h2>
              <p className="text-sm text-gray-400">Send notifications to multiple users</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Users Selection */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Target Audience</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'all', label: 'All Users', icon: Users, count: 45732, color: 'violet' },
                  { id: 'vip', label: 'VIP Users', icon: Crown, count: 3247, color: 'yellow' },
                  { id: 'regular', label: 'Regular Users', icon: Users, count: 42485, color: 'blue' }
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleInputChange('targetUsers', option.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        formData.targetUsers === option.id
                          ? 'border-violet-500 bg-violet-500/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          option.color === 'violet' ? 'bg-violet-500/20 text-violet-400' :
                          option.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{option.label}</p>
                          <p className="text-sm text-gray-400">{option.count.toLocaleString()} users</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Notification Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'push', label: 'Push Notification', icon: Bell },
                { id: 'email', label: 'Email', icon: MessageSquare },
                { id: 'both', label: 'Push + Email', icon: Send }
              ].map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('type', type.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 ${
                      formData.type === type.id
                        ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                        : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notification Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter notification title"
              required
              className="!bg-violet-500/10"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter your message..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-violet-500/10 text-white placeholder-gray-400"
            />
          </div>

          {/* Preview */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {formData.title || 'Notification Title'}
                    </p>
                    <p className="text-xs text-gray-400">VidGro Admin</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 ml-11">
                  {formData.message || 'Your notification message will appear here...'}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>Target: {getTargetUserCount().toLocaleString()} users</span>
                <Badge variant="default" className="text-xs">
                  {formData.type.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-violet-500/20">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title.trim() || !formData.message.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : `Send to ${getTargetUserCount().toLocaleString()} Users`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}