import React, { useEffect, useState } from 'react'
import { Search, MoreHorizontal, Crown, Coins, Calendar, Plus, Minus, DollarSign, UserPlus, Bell, Video, Eye, Trash2, Ban } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { UserProfilePanel } from './UserProfilePanel'
import { CreateUserModal } from './CreateUserModal'
import { BulkNotificationModal } from './BulkNotificationModal'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'
import { getSupabaseAdminClient } from '../../lib/supabase'

import { CoinAdjustmentModal } from './CoinAdjustmentModal'

export function UserManagement() {
  const { users, userFilters, usersLoading, fetchUsers, adjustUserCoins, toggleUserVip, setUserFilters } = useAdminStore()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [profileUser, setProfileUser] = useState<any>(null)
  const [isBulkNotificationOpen, setIsBulkNotificationOpen] = useState(false)
  const [userVideoCounts, setUserVideoCounts] = useState<Record<string, number>>({})
  const [isLoadingVideoCounts, setIsLoadingVideoCounts] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading user management data...')
      await fetchUsers()
      await fetchUserVideoCounts()
      console.log('User management data loaded')
    }
    loadData()
  }, [fetchUsers])

  const fetchUserVideoCounts = async () => {
    setIsLoadingVideoCounts(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        console.warn('Cannot fetch video counts - Supabase not initialized')
        setUserVideoCounts({})
        return
      }

      // Get video counts for all users
      const { data: videoCounts, error } = await supabase
        .from('videos')
        .select('user_id')
        .not('user_id', 'is', null)

      if (error) {
        console.error('Failed to fetch video counts:', error)
        setUserVideoCounts({})
        return
      }

      // Count videos per user
      const counts: Record<string, number> = {}
      videoCounts?.forEach(video => {
        if (video.user_id) {
          counts[video.user_id] = (counts[video.user_id] || 0) + 1
        }
      })

      setUserVideoCounts(counts)
      console.log('Video counts fetched:', counts)
    } catch (error) {
      console.error('Error fetching video counts:', error)
      setUserVideoCounts({})
    } finally {
      setIsLoadingVideoCounts(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(userFilters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(userFilters.search.toLowerCase())
    const matchesVip = userFilters.vipStatus === 'all' || 
                      (userFilters.vipStatus === 'vip' && user.is_vip) ||
                      (userFilters.vipStatus === 'regular' && !user.is_vip)
    const matchesCoins = user.coins >= userFilters.minCoins
    
    return matchesSearch && matchesVip && matchesCoins
  })

  const handleCoinAdjustment = async (amount: number, reason: string) => {
    if (!selectedUser) return
    try {
      await adjustUserCoins(selectedUser.id, amount, reason)
      // Refresh users list to show updated data
      await fetchUsers()
    } catch (error) {
      console.error('Failed to adjust coins:', error)
    }
  }

  const handleVipToggle = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [`vip-${userId}`]: true }))
    try {
      await toggleUserVip(userId)
      // Refresh users list to show updated data
      await fetchUsers()
    } catch (error) {
      console.error('Failed to toggle VIP status:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [`vip-${userId}`]: false }))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: true }))
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Delete user from database
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Refresh users list
      await fetchUsers()
      await fetchUserVideoCounts()
      
      // Close profile panel if it's open for this user
      if (profileUser?.id === userId) {
        closeProfilePanel()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: false }))
    }
  }

  const handleBanUser = async (userId: string, reason: string = 'Banned by admin') => {
    setActionLoading(prev => ({ ...prev, [`ban-${userId}`]: true }))
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const user = users.find(u => u.id === userId)
      const isBanned = (user as any)?.is_banned || false

      // Toggle ban status
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: !isBanned,
          ban_reason: !isBanned ? reason : null,
          ban_date: !isBanned ? new Date().toISOString() : null
        })
        .eq('id', userId)

      if (error) throw error

      // Refresh users list
      await fetchUsers()
    } catch (error) {
      console.error('Failed to ban/unban user:', error)
      alert('Failed to update user ban status. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [`ban-${userId}`]: false }))
    }
  }

  const openAdjustModal = (user: any) => {
    setSelectedUser(user)
    setIsAdjustModalOpen(true)
  }

  const closeAdjustModal = () => {
    setSelectedUser(null)
    setIsAdjustModalOpen(false)
  }

  const openProfilePanel = (user: any) => {
    setProfileUser(user)
    setIsProfilePanelOpen(true)
    // Dispatch popup state change event
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
  }

  const closeProfilePanel = () => {
    setProfileUser(null)
    setIsProfilePanelOpen(false)
    // Dispatch popup state change event
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: false } }))
  }

  const handleCreateUser = async (userData: any) => {
    // User creation will be implemented when backend API is ready
    console.log('Creating user:', userData)
    await fetchUsers() // Refresh users list
  }

  const handleSendBulkNotification = async (notification: any) => {
    console.log('Sending bulk notification:', notification)
    // Bulk notification sending will be implemented when backend API is ready
  }

  if (usersLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="h-12 md:h-16 gaming-skeleton rounded-xl" />
        <div className="h-64 md:h-96 gaming-skeleton rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Stats */}
      {(useAdminStore.getState().usersError) && (
        <div className="p-3 md:p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm">
          {(useAdminStore.getState().usersError) || 'Failed to load users.'}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{filteredUsers.length}</div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Users Shown</div>
          </CardContent>
        </Card>
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-violet-600 dark:text-violet-400">
              {filteredUsers.filter(u => u.is_vip).length}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">VIP Users</div>
          </CardContent>
        </Card>
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(filteredUsers.reduce((sum, u) => sum + u.coins, 0))}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Coins</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Filters */}
      <Card className="gaming-card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-xl">User Management</CardTitle>
            <div className="flex items-center space-x-2 md:space-x-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsBulkNotificationOpen(true)}
                className="flex items-center space-x-1 md:space-x-2"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Notify</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => setIsCreateUserModalOpen(true)}
                className="flex items-center space-x-1 md:space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2} />
              <Input
                placeholder="Search users by name or email..."
                value={userFilters.search}
                onChange={(e) => setUserFilters({ search: e.target.value })}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <select
                value={userFilters.vipStatus}
                onChange={(e) => setUserFilters({ vipStatus: e.target.value as any })}
                className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input"
              >
                <option value="all">All Users</option>
                <option value="vip">VIP Only</option>
                <option value="regular">Regular Only</option>
              </select>
              
              <Input
                type="number"
                placeholder="Min coins"
                value={userFilters.minCoins || ''}
                onChange={(e) => setUserFilters({ minCoins: Number(e.target.value) || 0 })}
                className="w-full sm:w-32 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-violet-500/5 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm gaming-glow">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openProfilePanel(user)}
                      className="gaming-interactive"
                    >
                      <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVipToggle(user.id)}
                        className="transition-all duration-200"
                        disabled={actionLoading[`vip-${user.id}`]}
                      >
                        {user.is_vip ? (
                          <Badge variant="vip" className="flex items-center space-x-1 hover:scale-105 text-xs">
                            <Crown className="w-3 h-3" strokeWidth={2} />
                            <span>VIP</span>
                          </Badge>
                        ) : (
                          <Badge variant="default" className="hover:bg-violet-100 hover:text-violet-700 text-xs">Regular</Badge>
                        )}
                      </button>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => openAdjustModal(user)}
                        className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-medium transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20 px-2 py-1 rounded text-sm"
                      >
                        <Coins className="w-3 h-3" strokeWidth={2} />
                        <span>{formatNumber(user.coins)}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Video className="w-3 h-3" strokeWidth={2} />
                      <span>{isLoadingVideoCounts ? '...' : (userVideoCounts[user.id] || 0)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" strokeWidth={2} />
                      <span>{format(new Date(user.created_at), 'MMM dd')}</span>
                    </div>
                    <div className="text-right">
                      <span>
                        {(() => {
                          const d = (user as any).last_active || user.updated_at || user.created_at
                          return d ? format(new Date(d), 'MMM dd') : '—'
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">User</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Coins</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Videos</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Joined</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Last Active</th>
                  <th className="text-right py-3 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {(user.email || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleVipToggle(user.id)}
                        disabled={actionLoading[`vip-${user.id}`]}
                        className="transition-all duration-200"
                      >
                        {actionLoading[`vip-${user.id}`] ? (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                            <span>...</span>
                          </Badge>
                        ) : user.is_vip ? (
                          <Badge variant="vip" className="flex items-center space-x-1 hover:scale-105">
                            <Crown className="w-3 h-3" strokeWidth={2} />
                            <span>VIP</span>
                          </Badge>
                        ) : (
                          <Badge variant="default" className="hover:bg-violet-100 hover:text-violet-700">Regular</Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openAdjustModal(user)}
                        className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-medium transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20 px-2 py-1 rounded"
                      >
                        <Coins className="w-4 h-4" strokeWidth={2} />
                        <span>{formatNumber(user.coins)}</span>
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <Video className="w-4 h-4 text-gray-400" strokeWidth={2} />
                        <span className="text-gray-900 dark:text-white">
                          {isLoadingVideoCounts ? (
                            <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            userVideoCounts[user.id] || 0
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" strokeWidth={2} />
                        <span>{format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {(() => {
                          const d = (user as any).last_active || user.updated_at || user.created_at
                          return d ? format(new Date(d), 'MMM dd, HH:mm') : '—'
                        })()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openProfilePanel(user)}
                        className="gaming-interactive"
                      >
                        <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Coin Adjustment Modal */}
      <CoinAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={closeAdjustModal}
        user={selectedUser}
        onAdjust={handleCoinAdjustment}
      />

      {/* User Profile Panel */}
      <UserProfilePanel
        isOpen={isProfilePanelOpen}
        onClose={closeProfilePanel}
        user={profileUser}
        onDeleteUser={handleDeleteUser}
        onBanUser={handleBanUser}
        actionLoading={actionLoading}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onCreateUser={handleCreateUser}
      />

      {/* Bulk Notification Modal */}
      <BulkNotificationModal
        isOpen={isBulkNotificationOpen}
        onClose={() => setIsBulkNotificationOpen(false)}
        onSend={handleSendBulkNotification}
      />
    </div>
  )
}
