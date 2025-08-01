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
        className={`relative h-9 w-16 rounded-full transition-all duration-300 hover:scale-105 p-0 border-2 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
            : 'bg-gradient-to-r from-slate-200 to-slate-300 border-slate-300 shadow-[0_0_20px_rgba(251,146,60,0.2)]'
        }`}
      >
        <div className={`absolute top-0.5 left-0.5 h-7 w-7 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        } ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {isDark ? (
            <Moon className="h-4 w-4 text-blue-400" />
          ) : (
            <Sun className="h-4 w-4 text-orange-400" />
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
    <header className="h-16 bg-white/90 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm dark:bg-slate-900/90 transition-all duration-300">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users, videos, or analytics..."
            className="pl-10 w-80 bg-white/70 focus:ring-violet-200 dark:bg-slate-800/70 dark:text-white"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100/70 dark:hover:bg-slate-700/70">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </Button>
        
        <ThemeToggle />
        
        <div className="flex items-center space-x-3 pl-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}