import React, { useState, useEffect, useRef } from 'react'
import { Bell, User, Moon, Sun, Search, Menu, X, LogOut, Shield, Settings } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { useAuth } from '../auth/AuthProvider'
import { useSystemNotifications } from '../../hooks/useSystemNotifications'
import { NotificationPanel } from '../notifications/NotificationPanel'

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
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const { notifications, unreadCount } = useSystemNotifications()

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

  // Auto-hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < 10) {
        // Always show header at top
        setIsHeaderVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsHeaderVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Initialize dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isProfileMenuOpen && !target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false)
      }
      if (isNotificationPanelOpen && !target.closest('.notification-panel-container')) {
        setIsNotificationPanelOpen(false)
      }
    }

    if (isProfileMenuOpen || isNotificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen, isNotificationPanelOpen])
  return (
    <>
      <header 
        ref={headerRef}
        className={`sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Search Bar */}
            <div className="relative max-w-lg w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users, videos, or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <div className="relative notification-panel-container">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Button>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium bg-red-500 text-white border-2 border-white dark:border-gray-900">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              
              {/* Notification Panel */}
              {isNotificationPanelOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setIsNotificationPanelOpen(false)}
                />
              )}
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 transition-colors" />
              )}
            </Button>

            {/* Admin Profile */}
            <div className="relative profile-menu-container">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
              </Button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{user?.username || 'Admin'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge variant="success" className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin Settings</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>
        )}
      </header>
    </>
  )
}