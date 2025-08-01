import React, { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardView } from './components/dashboard/DashboardView'
import { UserManagement } from './components/users/UserManagement'
import { VideoManagement } from './components/videos/VideoManagement'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />
      case 'users':
        return <UserManagement />
      case 'videos':
        return <VideoManagement />
      case 'analytics':
        return <DashboardView /> // Placeholder - would be separate analytics view
      case 'economy':
        return <DashboardView /> // Placeholder - would be economy management
      case 'moderation':
        return <VideoManagement /> // Placeholder - would be moderation tools
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Settings panel coming soon...</div>
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50">
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App