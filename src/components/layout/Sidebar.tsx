import React from 'react'
import { 
  BarChart3, 
  Users, 
  Video, 
  Settings, 
  Home,
  Coins,
  TrendingUp,
  Shield
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
  { id: 'economy', label: 'Economy', icon: Coins },
  { id: 'moderation', label: 'Moderation', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white/70 backdrop-blur-sm border-r border-gray-200/50 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">VidGro</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                activeTab === item.id
                  ? "bg-violet-100 text-violet-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}