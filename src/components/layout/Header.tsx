import React, { useState } from 'react'
import { Bell, Settings, User, Moon, Sun, Search, Menu, X, LogOut, Shield } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { AdminSettingsPanel } from '../admin/AdminSettingsPanel'
import { useAuth } from '../auth/AuthProvider'

interface HeaderProps {
  isPopupOpen?: boolean
}

export function Header({ isPopupOpen }: HeaderProps) {
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsProfileMenuOpen(false)
  }

  // Initialize dark mode on component mount
  React.useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <>
      <header className="gaming-header sticky top-0 z-30 border-b border-violet-500/20">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden gaming-interactive"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Search Bar */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users, videos, or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-violet-500/10 border-violet-500/30"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden gaming-interactive"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative gaming-interactive"
            >
              <Bell className="w-5 h-5" />
              <Badge 
                variant="danger" 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs gaming-pulse"
              >
                3
              </Badge>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="gaming-interactive"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500 gaming-glow" />
              ) : (
                <Moon className="w-5 h-5 text-violet-500 gaming-glow" />
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="gaming-interactive"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Admin Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative gaming-interactive"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm gaming-glow">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
              </Button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 gaming-card border border-violet-500/30 shadow-2xl z-50">
                  <div className="p-4 border-b border-violet-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold gaming-glow">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user?.username || 'Admin'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'admin@vidgro.com'}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="vip" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={toggleSettings}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-violet-500/10 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-500/10 rounded-lg transition-colors text-red-600 dark:text-red-400"
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
          <div className="md:hidden absolute top-full left-0 right-0 gaming-card border-t border-violet-500/20 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-violet-500/10 border-violet-500/30"
              />
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}

      {/* Admin Settings Panel */}
      <AdminSettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}