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
    <div className="w-64 gaming-sidebar h-screen sticky top-0 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg gaming-pulse">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text gaming-glow">
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
                "gaming-sidebar-item w-full text-left group",
                activeTab === item.id
                  ? "active"
                  : ""
              )}
            >
              <Icon className="w-5 h-5 transition-colors duration-200 gaming-glow" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <div className="ml-auto w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center gaming-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-violet-500 rounded-full gaming-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              )}
            </button>
          )
        })}
      </nav>
      
      {/* Bottom section with version info */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="gaming-card p-3">
          <div className="text-xs text-gray-500 font-medium dark:text-gray-400">Version 2.1.0</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Last updated: Today</div>
        </div>
      </div>
    </div>
  )
}