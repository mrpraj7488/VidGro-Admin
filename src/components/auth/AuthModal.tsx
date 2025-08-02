import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent } from '../ui/Card'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, username: string) => Promise<void>
}

export function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (mode === 'signup') {
      if (!formData.username) {
        newErrors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (mode === 'login') {
        await onLogin(formData.email, formData.password)
      } else {
        await onSignup(formData.email, formData.password, formData.username)
      }
      // Don't call onClose here - let the parent component handle it
      // The modal will close automatically when authentication succeeds
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ general: 'Authentication failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setErrors({})
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0 auth-background">
          <div className="auth-sine-wave"></div>
          <div className="auth-sine-wave auth-sine-wave-2"></div>
          <div className="auth-sine-wave auth-sine-wave-3"></div>
        </div>
      </div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md">
        <Card className="auth-modal-card">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative p-8 pb-6 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors gaming-interactive"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="auth-logo-container mb-6">
                <div className="auth-logo">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2 gaming-text-shadow">
                {mode === 'login' ? 'Welcome Back' : 'Join VidGro'}
              </h1>
              <p className="text-gray-400 text-sm">
                {mode === 'login' 
                  ? 'Sign in to access your admin dashboard' 
                  : 'Create your admin account to get started'
                }
              </p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="auth-error-message">
                    {errors.general}
                  </div>
                )}

                {/* Username (Signup only) */}
                {mode === 'signup' && (
                  <div className="auth-input-group">
                    <label className="auth-label">
                      <User className="w-4 h-4" />
                      Username
                    </label>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter your username"
                      className="auth-input"
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <span className="auth-field-error">{errors.username}</span>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="auth-input-group">
                  <label className="auth-label">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="auth-input"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="auth-field-error">{errors.email}</span>
                  )}
                </div>

                {/* Password */}
                <div className="auth-input-group">
                  <label className="auth-label">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className="auth-input pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="auth-field-error">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password (Signup only) */}
                {mode === 'signup' && (
                  <div className="auth-input-group">
                    <label className="auth-label">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="auth-input"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <span className="auth-field-error">{errors.confirmPassword}</span>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="auth-submit-button w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="auth-spinner"></div>
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    </div>
                  )}
                </Button>

                {/* Switch Mode */}
                <div className="text-center pt-4">
                  <p className="text-gray-400 text-sm">
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={switchMode}
                    className="auth-switch-button mt-2"
                    disabled={isLoading}
                  >
                    {mode === 'login' ? 'Create Account' : 'Sign In'}
                  </button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}