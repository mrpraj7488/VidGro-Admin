import React, { useState, useEffect } from 'react'
import { Bell, Moon, Sun, Search, Menu, X } from 'lucide-react'
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
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

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

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = currentScrollY - lastScrollY
      
      // Determine scroll direction
      const scrollingDown = scrollDifference > 0 && currentScrollY > 100
      const scrollingUp = scrollDifference < 0
      
      setIsScrollingDown(scrollingDown)
      
      // Show/hide header based on scroll direction and popup state
      if (isPopupOpen) {
        setIsHeaderVisible(false)
      } else if (scrollingUp || currentScrollY < 100) {
        setIsHeaderVisible(true)
      } else if (scrollingDown) {
        setIsHeaderVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isPopupOpen])

  // Update header visibility when popup state changes
  useEffect(() => {
    if (isPopupOpen) {
      setIsHeaderVisible(false)
    } else {
      setIsHeaderVisible(true)
    }
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        {/* Neon glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 backdrop-blur-xl border-b border-violet-500/30" />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Neon border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-40 blur-sm" />
        
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center space-x-4 flex-1 relative z-10">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden gaming-interactive hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Search Bar */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <Input
                placeholder="Search users, videos, or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-violet-500/10 border-violet-500/40 backdrop-blur-sm hover:border-violet-500/60 focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3 relative z-10">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden gaming-interactive hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            >
              <Search className="w-5 h-5 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative gaming-interactive hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            >
              <Bell className="w-5 h-5 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <Badge 
                variant="danger" 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs gaming-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"
              >
                3
              </Badge>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="gaming-interactive hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              ) : (
                <Moon className="w-5 h-5 text-violet-400 drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
              )}
            </Button>

            {/* Admin Profile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSettings}
              className="relative gaming-interactive hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.8)] hover:shadow-[0_0_25px_rgba(139,92,246,1)]">
                A
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-t border-violet-500/30 p-4 backdrop-blur-xl bg-black/30">
            {/* Neon glow for mobile menu */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-violet-500/10 border-violet-500/40 backdrop-blur-sm"
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