import React, { useState } from 'react'
import { Bell, User, Moon, Sun, Search, Menu, X, LogOut, Shield, Settings } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { useAuth } from '../auth/AuthProvider'

interface HeaderProps {
  isPopupOpen?: boolean
  onOpenSettings?: () => void
}

export function Header({ isPopupOpen, onOpenSettings }: HeaderProps) {
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    logout()
  }

  const handleOpenSettings = () => {
    setIsProfileMenuOpen(false)
    onOpenSettings?.()
  }

  // Initialize dark mode on component mount
  React.useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Auto-hide header on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsHeaderVisible(true)
      } 
      // Hide header when scrolling down (but not if a popup is open)
      else if (currentScrollY > lastScrollY && currentScrollY > 100 && !isPopupOpen && !isProfileMenuOpen && !isMobileMenuOpen) {
        setIsHeaderVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isPopupOpen, isProfileMenuOpen, isMobileMenuOpen])
  // Close profile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isProfileMenuOpen && !target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen])

  return (
    <>
      <header className={`gaming-header fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      } border-b border-violet-500/30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-lg shadow-violet-500/10`}>
        <div className="flex items-center justify-between px-4 md:px-6 py-3 relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center space-x-3 md:space-x-4 flex-1 relative z-10">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden gaming-interactive hover:bg-violet-500/10 hover:scale-110 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>

            {/* Search Bar */}
            <div className="relative max-w-md w-full hidden md:block group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-violet-500" />
              <Input
                placeholder="Search users, videos, or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-white/60 dark:!bg-slate-800/60 border-violet-500/20 hover:border-violet-500/40 focus:border-violet-500/60 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 md:space-x-3 relative z-10">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden gaming-interactive hover:bg-violet-500/10 hover:scale-110 transition-all duration-200"
            >
              <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative gaming-interactive hover:bg-violet-500/10 hover:scale-110 transition-all duration-200 group"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
              <Badge 
                variant="danger" 
                className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-xs gaming-pulse shadow-lg shadow-red-500/50"
              >
                3
              </Badge>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="gaming-interactive hover:bg-violet-500/10 hover:scale-110 transition-all duration-200 group"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500 gaming-glow group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-violet-500 gaming-glow group-hover:rotate-12 transition-transform duration-300" />
              )}
            </Button>

            {/* Admin Profile */}
            <div className="relative profile-menu-container">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative gaming-interactive hover:scale-110 transition-all duration-200 group"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm gaming-glow group-hover:shadow-lg group-hover:shadow-violet-500/50 transition-all duration-200">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full gaming-pulse" />
              </Button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 md:w-64 gaming-card border border-violet-500/30 shadow-2xl z-50 animate-slide-down backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
                  <div className="p-4 border-b border-violet-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold gaming-glow relative">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{user?.username || 'Admin'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="vip" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        {user?.role === 'super_admin' ? 'Super Admin' : 
                         user?.role === 'content_moderator' ? 'Content Moderator' :
                         user?.role === 'analytics_viewer' ? 'Analytics Viewer' :
                         user?.role === 'user_support' ? 'User Support' : 'Admin'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={handleOpenSettings}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-violet-500/10 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 text-sm group"
                    >
                      <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Admin Settings</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-500/10 rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 gaming-interactive text-sm group"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 gaming-card border-t border-violet-500/20 p-4 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 shadow-lg animate-slide-down">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-violet-500" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-white/60 dark:!bg-slate-800/60 border-violet-500/20 hover:border-violet-500/40 focus:border-violet-500/60 transition-all duration-200 backdrop-blur-sm shadow-sm"
              />
            </div>
          </div>
        )}
      </header>
    </>
  )
}