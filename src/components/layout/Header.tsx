import React, { useState, useEffect } from 'react'
import { Bell, Moon, Sun, Search, Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
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

  // Initialize dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Handle popup visibility override
  useEffect(() => {
    if (isPopupOpen) {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
  }, [isPopupOpen])

  return (
    <>
      <header className={`gaming-header-enhanced fixed top-0 left-0 right-0 z-30 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        {/* Enhanced background with transparency and blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 via-slate-800/30 to-slate-900/20 backdrop-blur-xl border-b border-violet-500/20" />
        
        {/* Neon glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        
        <div className="relative flex items-center justify-between px-4 md:px-6 py-4">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden gaming-interactive hover:bg-violet-500/20 border border-violet-500/30"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Search Bar */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4 gaming-glow" />
              <Input
                placeholder="Search users, videos, or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-slate-800/50 border-violet-500/30 text-white placeholder-violet-300/70 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden gaming-interactive hover:bg-violet-500/20 border border-violet-500/30"
            >
              <Search className="w-5 h-5 text-violet-400 gaming-glow" />
            </Button>

            {/* Enhanced Notifications with Neon Glow */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="gaming-interactive hover:bg-violet-500/20 border border-violet-500/30 relative overflow-hidden group"
              >
                {/* Neon glow background */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Bell icon with enhanced glow */}
                <Bell className="w-5 h-5 text-violet-400 gaming-glow relative z-10 group-hover:text-violet-300 transition-colors duration-300" />
                
                {/* Glowing notification badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold relative z-10">
                  {/* Outer glow */}
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-75 blur-sm" />
                  {/* Inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                  {/* Content */}
                  <span className="relative z-10 text-white text-xs font-bold">3</span>
                </div>
              </Button>
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="gaming-interactive hover:bg-violet-500/20 border border-violet-500/30 group"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400 gaming-glow group-hover:text-yellow-300 transition-colors duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-violet-400 gaming-glow group-hover:text-violet-300 transition-colors duration-300" />
              )}
            </Button>

            {/* Admin Profile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSettings}
              className="relative gaming-interactive hover:bg-violet-500/20 border border-violet-500/30 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm gaming-glow group-hover:scale-110 transition-transform duration-300 relative">
                {/* Enhanced glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                <span className="relative z-10">A</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay with enhanced styling */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-t border-violet-500/20">
            <div className="bg-slate-900/95 backdrop-blur-xl p-4 border-b border-violet-500/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4 gaming-glow" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 !bg-slate-800/50 border-violet-500/30 text-white placeholder-violet-300/70"
                />
              </div>
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