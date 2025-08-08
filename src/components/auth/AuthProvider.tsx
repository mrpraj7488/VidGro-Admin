import React, { createContext, useContext, useState, useEffect } from 'react'
import { envManager } from '../../lib/envManager'

interface User {
  id: string
  email: string
  username: string
  role: 'super_admin' | 'content_moderator' | 'analytics_viewer' | 'user_support'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('vidgro_admin_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('vidgro_admin_user')
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Check for default admin credentials
      const envVars = envManager.getEnvironmentVariables()
      const isDefaultAdmin = email === envVars.VITE_ADMIN_EMAIL && 
                            password === envVars.VITE_ADMIN_SECRET_KEY
      
      if (!isDefaultAdmin) {
        throw new Error('Invalid credentials')
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Create admin user data
      const userData = {
        id: 'admin-1',
        email,
        username: 'admin',
        role: 'super_admin' as const
      }
      
      setUser(userData)
      localStorage.setItem('vidgro_admin_user', JSON.stringify(userData))
      
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard'
    } catch (error) {
      throw new Error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true)
    try {
      // In real implementation, this would create admin account via Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const mockUser: User = {
        id: `admin-${Date.now()}`,
        email,
        username,
        role: 'content_moderator'
      }
      
      setUser(mockUser)
      localStorage.setItem('vidgro_admin_user', JSON.stringify(mockUser))
      
      // Redirect to dashboard after successful signup
      window.location.href = '/dashboard'
    } catch (error) {
      throw new Error('Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vidgro_admin_user')
    
    // Clear any other stored data
    try {
      sessionStorage.clear()
      // Clear any other VidGro related data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('vidgro_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
    
    // Redirect to auth screen
    window.location.href = '/auth'
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isInitialized,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}