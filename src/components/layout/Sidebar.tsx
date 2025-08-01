import React from 'react'
import { 
  BarChart3, 
  Users, 
  Video, 
  Settings, 
  Home,
  Bug,
  Play,
  Mail
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reports', label: 'Bug Reports', icon: Bug },
  { id: 'inbox', label: 'Inbox', icon: Mail, badge: 5 },
  { id: 'settings', label: 'System Config', icon: Settings }
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 lg:w-64 md:w-16 sm:w-16 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="hidden md:block lg:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              VidGro
            </h1>
            <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 group relative",
                activeTab === item.id
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="w-5 h-5 transition-colors duration-200 flex-shrink-0" strokeWidth={2} />
              <span className="font-medium hidden md:block lg:block">{item.label}</span>
              {item.badge && (
                <div className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-sm hidden md:flex lg:flex">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
              {activeTab === item.id && (
                <div className="absolute right-2 w-2 h-2 bg-violet-500 rounded-full" />
              )}
            </button>
          )
        })}
      </nav>
      
      {/* Bottom section with version info */}
      <div className="absolute bottom-6 left-4 right-4 hidden md:block lg:block">
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
          <div className="text-xs text-gray-500 font-medium dark:text-gray-400">Version 2.1.0</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Last updated: Today</div>
        </div>
      </div>
    </div>
  )
}