import React, { useState } from 'react'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { AuthModal } from './components/auth/AuthModal'
import { AdminSettingsPanel } from './components/admin/AdminSettingsPanel'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardView } from './components/dashboard/DashboardView'
import { UserManagement } from './components/users/UserManagement'
import { VideoManagement } from './components/videos/VideoManagement'
import { AnalyticsView } from './components/analytics/AnalyticsView'
import { BugReportsView } from './components/reports/BugReportsView'
import { SystemConfigView } from './components/settings/SystemConfigView'
import { InboxView } from './components/inbox/InboxView'

function AppContent() {
  const { isAuthenticated, isLoading, login, signup, user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false)

  // Track popup state for header visibility
  React.useEffect(() => {
    const handlePopupChange = (event: CustomEvent) => {
      setIsPopupOpen(event.detail.isOpen)
    }

    window.addEventListener('popupStateChange', handlePopupChange as EventListener)
    return () => window.removeEventListener('popupStateChange', handlePopupChange as EventListener)
  }, [])

  // Show auth modal if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setIsAuthModalOpen(true)
    } else {
      setIsAuthModalOpen(false)
    }
  }, [isAuthenticated, isLoading])

  const handleOpenAdminSettings = () => {
    setIsAdminSettingsOpen(true)
    // Dispatch popup state change event
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
  }

  const handleCloseAdminSettings = () => {
    setIsAdminSettingsOpen(false)
    // Dispatch popup state change event
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: false } }))
  }
  
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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-500/5 via-transparent to-emerald-500/5 flex items-center justify-center">
        <div className="text-center">
          <div className="auth-spinner-large mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading VidGro Admin</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {}} // Prevent closing when not authenticated
        onLogin={login}
        onSignup={signup}
      />
    )
  }
  return (
    <>
      <ErrorBoundary>
        <div className="min-h-screen transition-colors duration-300">
          <div className="flex">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1">
              <Header isPopupOpen={isPopupOpen} onOpenSettings={handleOpenAdminSettings} />
              <main className="p-4 md:p-6 dark:text-white min-h-screen relative pt-16 sm:pt-20">
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


      {/* Admin Settings Panel */}
      <AdminSettingsPanel
        isOpen={isAdminSettingsOpen}
        onClose={handleCloseAdminSettings}
      />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App