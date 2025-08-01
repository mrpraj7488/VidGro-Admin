import React, { useState } from 'react'
import { ErrorBoundary } from './components/common/ErrorBoundary'
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1">
            <Header />
            <main className="p-4 md:p-6 dark:text-white min-h-[calc(100vh-4rem)]">
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App