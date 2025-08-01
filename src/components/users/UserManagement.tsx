import React, { useEffect, useState } from 'react'
import { Search, Filter, MoreHorizontal, Crown, Coins, Calendar, Plus, Minus, DollarSign } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

interface CoinAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onAdjust: (amount: number, reason: string) => Promise<void>
}

function CoinAdjustmentModal({ isOpen, onClose, user, onAdjust }: CoinAdjustmentModalProps) {
  const [amount, setAmount] = useState<number>(0)
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !reason.trim()) return

    setIsLoading(true)
    try {
      await onAdjust(amount, reason)
      onClose()
      setAmount(0)
      setReason('')
    } catch (error) {
      console.error('Failed to adjust coins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Adjust Coins for {user.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Current balance: {formatNumber(user.coins)} coins
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (use negative for deduction)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount..."
                className="pr-20"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  type="button"
                  onClick={() => setAmount(Math.abs(amount) * -1)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(Math.abs(amount))}
                  className="p-1 text-green-500 hover:bg-green-50 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for this adjustment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !amount || !reason.trim()}
              className="flex items-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>{isLoading ? 'Adjusting...' : 'Adjust Coins'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
export function UserManagement() {
  const { users, userFilters, isLoading, fetchUsers, adjustUserCoins, toggleUserVip, setUserFilters } = useAdminStore()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
        <div className="h-96 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
                      <Button variant="ghost" size="icon">
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

      {/* Coin Adjustment Modal */}
      <CoinAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={closeAdjustModal}
        user={selectedUser}
        onAdjust={handleCoinAdjustment}
      />
    </div>
  )
}