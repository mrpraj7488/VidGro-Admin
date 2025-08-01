import React, { useEffect, useState } from 'react'
import { Search, Filter, MoreHorizontal, Crown, Coins, Calendar } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

export function UserManagement() {
  const { users, userFilters, isLoading, fetchUsers, updateUserCoins, setUserFilters } = useAdminStore()
  const [editingCoins, setEditingCoins] = useState<{ userId: string; coins: number } | null>(null)

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

  const handleCoinsUpdate = async (userId: string, newCoins: number) => {
    await updateUserCoins(userId, newCoins)
    setEditingCoins(null)
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
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
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
        <CardContent className="p-0 gaming-table">
          <div className="overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr>
                  <th className="text-left">User</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Coins</th>
                  <th className="text-left">Videos</th>
                  <th className="text-left">Joined</th>
                  <th className="text-left">Last Active</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm gaming-pulse">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.is_vip ? (
                        <Badge variant="vip" className="flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>VIP</span>
                        </Badge>
                      ) : (
                        <Badge variant="default">Regular</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingCoins?.userId === user.user_id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={editingCoins.coins}
                            onChange={(e) => setEditingCoins({ ...editingCoins, coins: Number(e.target.value) })}
                            className="w-24 h-8"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCoinsUpdate(user.user_id, editingCoins.coins)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCoins(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingCoins({ userId: user.user_id, coins: user.coins })}
                          className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-medium gaming-glow gaming-interactive"
                        >
                          <Coins className="w-4 h-4" />
                          <span>{formatNumber(user.coins)}</span>
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900 dark:text-white">{user.videos_posted}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 gaming-glow" />
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
                        <MoreHorizontal className="w-4 h-4" />
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
          <CardContent className="p-6 text-center gaming-metric">
            <div className="gaming-metric-value !text-2xl">{filteredUsers.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Users Shown</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center gaming-metric">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 gaming-glow">
              {filteredUsers.filter(u => u.is_vip).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">VIP Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center gaming-metric">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 gaming-glow">
              {formatNumber(filteredUsers.reduce((sum, u) => sum + u.coins, 0))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Coins</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}