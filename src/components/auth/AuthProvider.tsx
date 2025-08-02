import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  username: string
  role: 'admin' | 'super_admin'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock authentication - in real app, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // For demo purposes, accept any email/password combination
      const mockUser: User = {
        id: 'admin-1',
        email,
        username: email.split('@')[0],
        role: 'admin'
      }
      
      setUser(mockUser)
      localStorage.setItem('vidgro_admin_user', JSON.stringify(mockUser))
    } catch (error) {
      throw new Error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true)
    try {
      // Mock signup - in real app, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const mockUser: User = {
        id: `admin-${Date.now()}`,
        email,
        username,
        role: 'admin'
      }
      
      setUser(mockUser)
      localStorage.setItem('vidgro_admin_user', JSON.stringify(mockUser))
    } catch (error) {
      throw new Error('Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vidgro_admin_user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
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