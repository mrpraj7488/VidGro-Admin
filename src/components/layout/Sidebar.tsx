import React from 'react'
import { 
  BarChart3, 
  Users, 
  Video, 
  Settings, 
  Home,
  Bug,
  Play,
  Mail,
  Database,
  Coins
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
  { id: 'coin-transactions', label: 'Coin Transactions', icon: Coins },
  { id: 'reports', label: 'Bug Reports', icon: Bug },
  { id: 'inbox', label: 'Inbox', icon: Mail, badge: 5 },
  { id: 'settings', label: 'System Config', icon: Settings }
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  // Listen for navigation events from dashboard quick actions
  React.useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      onTabChange(event.detail)
    }

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener)
    return () => window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener)
  }, [onTabChange])

  return (
    <div className="w-16 md:w-64 gaming-card border-r border-violet-200/50 dark:border-violet-500/30 h-screen sticky top-0 transition-all duration-300 shadow-xl z-20 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg gaming-pulse gaming-shine-enhanced">
            <Play className="w-6 h-6 text-white gaming-icon-glow" strokeWidth={2} />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold gaming-gradient-text">
              VidGro
            </h1>
            <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "gaming-sidebar-item gaming-shine-enhanced w-full text-left group",
                activeTab === item.id
                  ? "active text-violet-700 dark:text-violet-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="w-5 h-5 transition-all duration-300 flex-shrink-0 gaming-icon-glow" strokeWidth={2} />
              <span className="font-medium hidden md:block">{item.label}</span>
              {item.badge && (
                <div className="ml-auto min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 hidden md:flex gaming-pulse gaming-sparkle gaming-shine-enhanced px-1">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </button>
          )
        })}
      </nav>
      
      {/* Bottom section with version info */}
      <div className="p-4 mt-auto hidden md:block">
        <div className="gaming-card gaming-shine-enhanced p-3">
          <div className="text-xs text-gray-500 font-medium dark:text-gray-400 gaming-text-shadow">Version 2.1.0</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Last updated: Today</div>
        </div>
      </div>
    </div>
  )
}
