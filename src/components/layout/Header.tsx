import React from 'react'
import { Bell, Search, User, Settings } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Header() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users, videos, or analytics..."
            className="pl-10 w-80 bg-white/70 border-gray-200/60 focus:border-violet-300 focus:ring-violet-200"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100/70">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </Button>
        
        <Button variant="ghost" size="icon" className="hover:bg-gray-100/70">
          <Settings className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200/60">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}