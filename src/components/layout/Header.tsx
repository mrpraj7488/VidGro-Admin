import React, { useState, useEffect } from 'react'
import { Bell, User, Moon, Sun, Search, Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { AdminSettingsPanel } from '../admin/AdminSettingsPanel'

interface HeaderProps {
  isPopupOpen?: boolean
}

export function Header({ isPopupOpen = false }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Don't hide header if any popup is open
      if (isPopupOpen || isSettingsOpen || isMobileMenuOpen) {
        return
      }

      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide header when scrolling down (after 100px)
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isPopupOpen, isSettingsOpen, isMobileMenuOpen])

  // Hide header instantly when popup opens
  useEffect(() => {
    if (isPopupOpen) {
      setIsVisible(false)
    } else {
      // Show header when popup closes
      setIsVisible(true)
    }
  }, [isPopupOpen])

  // Initialize dark mode on component mount
  React.useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="gaming-header-enhanced border-b border-violet-500/20 h-14 md:h-16">
          <div className="flex items-center justify-between px-4 md:px-6 py-2 md:py-3">
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
              <div className="relative max-w-sm w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users, videos, or reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 !bg-white/10 dark:!bg-slate-800/30 border-violet-500/30 backdrop-blur-md text-sm"
                />
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden gaming-interactive"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative gaming-interactive"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                <Badge 
                  variant="danger" 
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold gaming-pulse px-1 shadow-lg border-2 border-white dark:border-slate-800"
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
                  <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 gaming-glow" />
                ) : (
                  <Moon className="w-4 h-4 md:w-5 md:h-5 text-violet-500 gaming-glow" />
                )}
              </Button>

              {/* Admin Profile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSettings}
                className="relative gaming-interactive"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm gaming-glow">
                  A
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 gaming-card border-t border-violet-500/20 p-4 backdrop-blur-md z-40 mx-2 rounded-b-lg">
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
        </div>
      </header>

      {/* Admin Settings Panel */}
      <AdminSettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}