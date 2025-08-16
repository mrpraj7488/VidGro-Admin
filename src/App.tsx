import React, { useState, useEffect } from 'react'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { AuthScreen } from './components/auth/AuthScreen'
import { AdminSettingsPanel } from './components/admin/AdminSettingsPanel'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardView } from './components/dashboard/DashboardView'
import { UserManagement } from './components/users/UserManagement'
import { VideoManagement } from './components/videos/VideoManagement'
import { AnalyticsView } from './components/analytics/AnalyticsView'
import { CoinTransactionsView } from './components/analytics/CoinTransactionsView'
import BugReportsView from './components/reports/BugReportsView'
import { SystemConfigView } from './components/settings/SystemConfigView'
import { InboxView } from './components/inbox/InboxView'


function AppContent() {
  const { isAuthenticated, isLoading, isInitialized, login, signup, user } = useAuth()
  const [activeTab, setActiveTab] = useState(() => {
    // Restore last active tab from localStorage
    return localStorage.getItem('vidgro_active_tab') || 'dashboard'
  })
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false)

  // Debug environment variables in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔧 Development Mode - Environment Variables:');
      console.log('VITE_ADMIN_EMAIL:', import.meta.env.VITE_ADMIN_EMAIL);
      console.log('VITE_ADMIN_SECRET_KEY:', import.meta.env.VITE_ADMIN_SECRET_KEY ? '***' : 'undefined');
      console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    }
  }, [])

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vidgro_active_tab', activeTab)
  }, [activeTab])

  // Track popup state for header visibility
  React.useEffect(() => {
    const handlePopupChange = (event: CustomEvent) => {
      setIsPopupOpen(event.detail.isOpen)
    }

    window.addEventListener('popupStateChange', handlePopupChange as EventListener)
    return () => window.removeEventListener('popupStateChange', handlePopupChange as EventListener)
  }, [])

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
      case 'coin-transactions':
        return <CoinTransactionsView />
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

  // Show loading screen while initializing
  if (isLoading || !isInitialized) {
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

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthScreen
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
              <Header 
                isPopupOpen={isPopupOpen} 
                onOpenSettings={handleOpenAdminSettings} 
              />
                <main className="p-2 md:p-4 lg:p-6 dark:text-white min-h-screen relative pt-16 sm:pt-20">
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