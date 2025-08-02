import React, { useEffect, useState } from 'react'
import { Search, MoreHorizontal, Crown, Coins, Calendar, Plus, Minus, DollarSign, UserPlus, Bell } from 'lucide-react'
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

import { CoinAdjustmentModal } from './CoinAdjustmentModal'

export function UserManagement() {
  const { users, userFilters, isLoading, fetchUsers, adjustUserCoins, toggleUserVip, setUserFilters } = useAdminStore()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [profileUser, setProfileUser] = useState<any>(null)
  const [isBulkNotificationOpen, setIsBulkNotificationOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
    await adjustUserCoins(selectedUser.id, amount, reason)
  }

  const handleVipToggle = async (userId: string) => {
    await toggleUserVip(userId)
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
    // TODO: Implement user creation
    console.log('Creating user:', userData)
    await fetchUsers() // Refresh users list
  }

  const handleSendBulkNotification = async (notification: any) => {
    console.log('Sending bulk notification:', notification)
    // TODO: Implement actual bulk notification sending
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 gaming-skeleton rounded-xl" />
        <div className="h-96 gaming-skeleton rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredUsers.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Users Shown</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {filteredUsers.filter(u => u.is_vip).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">VIP Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(filteredUsers.reduce((sum, u) => sum + u.coins, 0))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Coins</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                onClick={() => setIsBulkNotificationOpen(true)}
                className="flex items-center space-x-2"
              >
                <Bell className="w-4 h-4" />
                <span>Bulk Notify</span>
              </Button>
              <Button 
                onClick={() => setIsCreateUserModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2} />
              <Input
                placeholder="Search users by name or email..."
                value={userFilters.search}
                onChange={(e) => setUserFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <select
              value={userFilters.vipStatus}
              onChange={(e) => setUserFilters({ vipStatus: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
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
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                          {user.username.charAt(0).toUpperCase()}
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
                        className="transition-all duration-200"
                      >
                        {user.is_vip ? (
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
                      <span className="text-gray-900 dark:text-white">{user.videos_posted}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" strokeWidth={2} />
                        <span>{format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(user.last_active), 'MMM dd, HH:mm')}
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