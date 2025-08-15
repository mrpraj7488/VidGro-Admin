import React, { useState, useEffect } from 'react'
import { X, User, Mail, Lock, Camera, Save, Eye, EyeOff, Shield } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

interface AdminSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSettingsPanel({ isOpen, onClose }: AdminSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: null as File | null
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAdminData()
    }
  }, [isOpen])

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      // Get admin data from environment or stored data
      const adminEmail = process.env.VITE_ADMIN_EMAIL || ''
      const adminName = localStorage.getItem('vidgro_admin_name') || ''
      
      setFormData(prev => ({
        ...prev,
        name: adminName,
        email: adminEmail
      }))
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Lock }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }))
    }
  }

  const handleSave = async () => {
    // Save functionality will be implemented when backend API is ready
    console.log('Saving admin settings:', formData)
  }

  const handleForgotPassword = () => {
    // Forgot password functionality will be implemented when backend API is ready
    console.log('Forgot password triggered')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-500 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full gaming-card !rounded-l-2xl !rounded-r-none border-l border-violet-500/30 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
                Admin Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your admin account
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="gaming-interactive">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-violet-500/20">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-violet-50/50 dark:bg-violet-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold gaming-glow">
                      {formData.name.charAt(0)}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors gaming-interactive">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Click camera icon to change picture
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                {/* Forgot Password */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    onClick={handleForgotPassword}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Password Reset Email
                  </Button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Theme Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme by default</p>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300"
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 translate-x-6" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive admin notifications via email</p>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300"
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-violet-500/20">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
