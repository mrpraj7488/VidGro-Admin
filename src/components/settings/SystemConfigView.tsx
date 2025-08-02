import React, { useState } from 'react'
import { Settings, Database, Mail, Server, Activity, HardDrive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { SettingsView } from './SettingsView'
import { BackupScreen } from './BackupScreen'
import { EmailSMTPScreen } from './EmailSMTPScreen'
import { SystemHealthScreen } from './SystemHealthScreen'
import { EnvironmentVariablesScreen } from './EnvironmentVariablesScreen'

export function SystemConfigView() {
  const [activeScreen, setActiveScreen] = useState('settings')

  const screens = [
    { id: 'settings', label: 'General Settings', icon: Settings },
    { id: 'environment', label: 'Environment Variables', icon: Server },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'email', label: 'Email SMTP', icon: Mail },
    { id: 'health', label: 'System Health', icon: Activity }
  ]

  const renderScreen = () => {
    switch (activeScreen) {
      case 'settings':
        return <SettingsView />
      case 'environment':
        return <EnvironmentVariablesScreen />
      case 'backup':
        return <BackupScreen />
      case 'email':
        return <EmailSMTPScreen />
      case 'health':
        return <SystemHealthScreen />
      default:
        return <SettingsView />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
          System Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage system settings, environment variables, and configurations
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {screens.map((screen) => {
          const Icon = screen.icon
          return (
            <Card
              key={screen.id}
              className={`cursor-pointer gaming-interactive transition-all duration-300 ${
                activeScreen === screen.id
                  ? 'ring-2 ring-violet-500 bg-violet-50/50 dark:bg-violet-900/20'
                  : 'hover:bg-violet-50/30 dark:hover:bg-violet-900/10'
              }`}
              onClick={() => setActiveScreen(screen.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                  activeScreen === screen.id
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white gaming-glow'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                  {screen.label}
                </h3>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Screen Content */}
      <div className="transition-all duration-500 ease-in-out">
        {renderScreen()}
      </div>
    </div>
  )
}