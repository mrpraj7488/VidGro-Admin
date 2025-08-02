import React from 'react'
import { Bell, Search, User, Moon, Sun } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false)
  
  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`gaming-shine relative h-9 w-16 rounded-full transition-all duration-300 hover:scale-105 p-0 border-2 ${
          isDark 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-slate-200 border-slate-300'
        }`}
      >
        <div className={`absolute top-0.5 left-0.5 h-7 w-7 rounded-full shadow-lg transition-all duration-500 ease-in-out flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        } ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {isDark ? (
            <Moon className="h-4 w-4 text-blue-400 gaming-icon-glow" strokeWidth={2} />
          ) : (
            <Sun className="h-4 w-4 text-orange-400 gaming-icon-glow" strokeWidth={2} />
          )}
        </div>
      </Button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </div>
    </div>
  )
}

export function Header() {
  return (
    <header className="gaming-header gaming-shine h-16 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 gaming-icon-glow" strokeWidth={2} />
          <Input
            placeholder="Search users, videos, or analytics..."
            className="pl-10 w-full md:w-80"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="relative gaming-pulse gaming-sparkle gaming-shine-enhanced">
          <Bell className="w-5 h-5 gaming-icon-glow" strokeWidth={2} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/50"></span>
        </Button>
        
        <ThemeToggle />
        
        <div className="flex items-center space-x-3 pl-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg gaming-pulse gaming-shine-enhanced">
            <User className="w-4 h-4 text-white gaming-icon-glow" strokeWidth={2} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white gaming-text-shadow">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}