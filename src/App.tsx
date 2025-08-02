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
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Track popup state for header visibility
  React.useEffect(() => {
    const handlePopupChange = (event: CustomEvent) => {
      setIsPopupOpen(event.detail.isOpen)
    }

    window.addEventListener('popupStateChange', handlePopupChange as EventListener)
    return () => window.removeEventListener('popupStateChange', handlePopupChange as EventListener)
  }, [])
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
      <div className="min-h-screen transition-colors duration-300">
        <div className="flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1">
            <Header isPopupOpen={isPopupOpen} />
            <main className="p-4 md:p-6 dark:text-white min-h-[calc(100vh-4rem)] relative pt-20 md:pt-24">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
              <div className="relative z-10">
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App