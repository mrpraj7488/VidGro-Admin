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
    <div className="w-64 bg-white/90 backdrop-blur-xl h-screen sticky top-0 shadow-sm dark:bg-slate-900/90 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
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
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group",
                activeTab === item.id
                  ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 shadow-sm dark:from-violet-500/20 dark:to-purple-500/20 dark:text-violet-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors duration-200",
                activeTab === item.id ? "text-violet-600 dark:text-violet-400" : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
              )} />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <div className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-violet-500 rounded-full" />
              )}
            </button>
          )
        })}
      </nav>
      
      {/* Bottom section with version info */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 dark:from-slate-800 dark:to-slate-700">
          <div className="text-xs text-gray-500 font-medium dark:text-gray-400">Version 2.1.0</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Last updated: Today</div>
        </div>
      </div>
    </div>
  )
}