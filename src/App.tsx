import React, { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardView } from './components/dashboard/DashboardView'
import { UserManagement } from './components/users/UserManagement'
import { VideoManagement } from './components/videos/VideoManagement'
import { AnalyticsView } from './components/analytics/AnalyticsView'
import { BugReportsView } from './components/reports/BugReportsView'
import { SystemConfigView } from './components/settings/SystemConfigView'
import { InboxView } from './components/inbox/InboxView'

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
        return <AnalyticsView />
      case 'reports':
        return <BugReportsView />
      case 'inbox':
        return <InboxView />
      case 'settings':
        return <SystemConfigView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500 relative overflow-hidden">
      {/* Gaming Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl gaming-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl gaming-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl gaming-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          <Header />
          <main className="p-6 dark:text-white relative z-10">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App