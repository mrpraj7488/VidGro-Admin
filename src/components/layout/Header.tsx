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
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        {/* Header background */}
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border-b border-violet-500/20" />
        
        {/* Subtle bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 relative z-10">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden hover:bg-violet-500/20"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Search Bar */}
            <div className="relative max-w-sm sm:max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4" />
              <Input
                placeholder="Search users, videos, or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-violet-500/10 border-violet-500/30 hover:border-violet-500/50 focus:border-violet-500 text-sm"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden hover:bg-violet-500/20"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-violet-500/20"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <Badge 
                variant="danger" 
                className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hover:bg-violet-500/20"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
              )}
            </Button>

            {/* Admin Profile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSettings}
              className="relative hover:bg-violet-500/20"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                A
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-t border-violet-500/20 p-4 bg-slate-900/95 backdrop-blur-xl">
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4" />
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