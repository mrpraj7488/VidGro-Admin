import React, { useState } from 'react'
import { Bell, Settings, User, Moon, Sun, Search, Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { AdminSettingsPanel } from '../admin/AdminSettingsPanel'

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSettings}
              className="relative gaming-interactive"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm gaming-glow">
                A
              </div>
            </Button>
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

      {/* Admin Settings Panel */}
      <AdminSettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}