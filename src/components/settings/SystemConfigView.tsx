import React, { useState } from 'react'
import { Settings, Database, Server, Activity, HardDrive, ChevronRight, Shield, Code } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { EnhancedSystemHealth } from './EnhancedSystemHealth'
import { EnvironmentVariablesScreen } from './EnvironmentVariablesScreen'
import { DatabaseBackupScreen } from './DatabaseBackupScreen'
import { HealthAlertProvider } from './HealthAlertProvider'

export function SystemConfigView() {
  const [activeScreen, setActiveScreen] = useState('environment')

  const screens = [
    { 
      id: 'environment', 
      label: 'Environment Variables', 
      icon: Server,
      description: 'Manage API keys and environment configuration',
      color: 'blue'
    },
    { 
      id: 'database-backup', 
      label: 'Backup & Restore', 
      icon: Database,
      description: 'Supabase database backups and restoration',
      color: 'emerald'
    },
    { 
      id: 'health', 
      label: 'System Health', 
      icon: Activity,
      description: 'Monitor system performance and status',
      color: 'red'
    }
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      violet: {
        bg: isActive ? 'bg-violet-500/20 dark:bg-violet-500/30' : 'bg-violet-500/5 dark:bg-violet-500/10',
        border: isActive ? 'border-violet-500/50 dark:border-violet-400/50' : 'border-violet-500/20 dark:border-violet-500/30',
        icon: isActive ? 'bg-violet-500 text-white' : 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
        text: isActive ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300',
        glow: isActive ? 'shadow-violet-500/25' : ''
      },
      blue: {
        bg: isActive ? 'bg-blue-500/20 dark:bg-blue-500/30' : 'bg-blue-500/5 dark:bg-blue-500/10',
        border: isActive ? 'border-blue-500/50 dark:border-blue-400/50' : 'border-blue-500/20 dark:border-blue-500/30',
        icon: isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
        text: isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300',
        glow: isActive ? 'shadow-blue-500/25' : ''
      },
      emerald: {
        bg: isActive ? 'bg-emerald-500/20 dark:bg-emerald-500/30' : 'bg-emerald-500/5 dark:bg-emerald-500/10',
        border: isActive ? 'border-emerald-500/50 dark:border-emerald-400/50' : 'border-emerald-500/20 dark:border-emerald-500/30',
        icon: isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
        text: isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300',
        glow: isActive ? 'shadow-emerald-500/25' : ''
      },
      orange: {
        bg: isActive ? 'bg-orange-500/20 dark:bg-orange-500/30' : 'bg-orange-500/5 dark:bg-orange-500/10',
        border: isActive ? 'border-orange-500/50 dark:border-orange-400/50' : 'border-orange-500/20 dark:border-orange-500/30',
        icon: isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
        text: isActive ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300',
        glow: isActive ? 'shadow-orange-500/25' : ''
      },
      red: {
        bg: isActive ? 'bg-red-500/20 dark:bg-red-500/30' : 'bg-red-500/5 dark:bg-red-500/10',
        border: isActive ? 'border-red-500/50 dark:border-red-400/50' : 'border-red-500/20 dark:border-red-500/30',
        icon: isActive ? 'bg-red-500 text-white' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
        text: isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300',
        glow: isActive ? 'shadow-red-500/25' : ''
      }
    }
    
    const purple = {
      bg: isActive ? 'bg-purple-500/20 dark:bg-purple-500/30' : 'bg-purple-500/5 dark:bg-purple-500/10',
      border: isActive ? 'border-purple-500/50 dark:border-purple-400/50' : 'border-purple-500/20 dark:border-purple-500/30',
      icon: isActive ? 'bg-purple-500 text-white' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
      text: isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300',
      glow: isActive ? 'shadow-purple-500/25' : ''
    }
    
    colors.purple = purple
    return colors[color] || colors.violet
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'environment':
        return (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <EnvironmentVariablesScreen />
          </div>
        )
      case 'database-backup':
        return (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <DatabaseBackupScreen />
          </div>
        )
      case 'health':
        return (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <HealthAlertProvider>
              <EnhancedSystemHealth />
            </HealthAlertProvider>
          </div>
        )
      default:
        return (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <EnvironmentVariablesScreen />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
          System Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
          Manage system settings, environment variables, and configurations
        </p>
      </div>

      {/* Navigation Cards - Enhanced Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {screens.map((screen) => {
          const Icon = screen.icon
          const isActive = activeScreen === screen.id
          const colorClasses = getColorClasses(screen.color, isActive)
          
          return (
            <Card
              key={screen.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group border-2 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.glow ? `shadow-xl ${colorClasses.glow}` : 'hover:shadow-lg'} relative overflow-hidden`}
              onClick={() => setActiveScreen(screen.id)}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-12 scale-150"></div>
              </div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${colorClasses.icon} ${isActive ? 'gaming-glow scale-110 shadow-lg' : 'group-hover:scale-105'} flex-shrink-0`}>
                    <Icon className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold text-lg transition-colors duration-300 ${colorClasses.text}`}>
                        {screen.label}
                      </h3>
                      {isActive && (
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${colorClasses.icon.includes('bg-violet') ? 'bg-violet-500' : colorClasses.icon.includes('bg-blue') ? 'bg-blue-500' : colorClasses.icon.includes('bg-emerald') ? 'bg-emerald-500' : colorClasses.icon.includes('bg-orange') ? 'bg-orange-500' : 'bg-red-500'} gaming-pulse`} />
                          <span className={`text-xs font-semibold ${colorClasses.text}`}>ACTIVE</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                      {screen.description}
                    </p>
                    
                    {/* Action Indicator */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${isActive ? colorClasses.text : 'text-gray-500 dark:text-gray-400'}`}>
                        {isActive ? 'Currently viewing' : 'Click to access'}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? colorClasses.icon : 'bg-gray-100 dark:bg-gray-700'} group-hover:scale-110`}>
                        <svg className={`w-3 h-3 transition-transform duration-300 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'} group-hover:translate-x-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Active Border Accent */}
              {isActive && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClasses.icon.includes('bg-violet') ? 'bg-violet-500' : colorClasses.icon.includes('bg-blue') ? 'bg-blue-500' : colorClasses.icon.includes('bg-emerald') ? 'bg-emerald-500' : colorClasses.icon.includes('bg-orange') ? 'bg-orange-500' : 'bg-red-500'} gaming-pulse`} />
              )}
            </Card>
          )
        })}
      </div>

      {/* Breadcrumb Navigation for Mobile */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 lg:hidden">
        <span>System Configuration</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white font-medium">
          {screens.find(s => s.id === activeScreen)?.label}
        </span>
      </div>

      {/* Screen Content */}
      <div className="transition-all duration-500 ease-in-out">
        <div className="gaming-card !p-0 overflow-hidden">
          <div className="p-4 md:p-6">
            {renderScreen()}
          </div>
        </div>
      </div>
    </div>
  )
}