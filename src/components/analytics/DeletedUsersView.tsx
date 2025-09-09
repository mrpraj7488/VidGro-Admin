import React, { useState, useEffect } from 'react'
import { UserX, Calendar, Search, Download, Clock, User, Trash2, CheckSquare, Square, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { getSupabaseAdminClient } from '../../lib/supabase'
import { format, formatDistanceToNow, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

interface DeletedUser {
  id: string
  username: string
  email: string
  deleted_at: string
  deletion_reason?: string
  coins_at_deletion?: number
  videos_count?: number
  referral_count?: number
  avatar_url?: string
  is_vip?: boolean
  vip_expires_at?: string
}

export function DeletedUsersView() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0
  })

  useEffect(() => {
    fetchDeletedUsers()
  }, [])

  const fetchDeletedUsers = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Fetch deleted users from deleted_users table
      const { data: deletedUsersData, error } = await supabase
        .from('deleted_users')
        .select('user_id, username, email, deleted_at, deletion_reason, coins, total_videos, total_referrals, deleted_by, original_created_at, avatar_url, metadata')
        .order('deleted_at', { ascending: false })
        .limit(500)

      if (error) {
        console.error('Failed to fetch deleted users:', error)
        setDeletedUsers([])
        return
      }

      // Process deleted users data
      const processedUsers: DeletedUser[] = (deletedUsersData || []).map(user => {
        let metadata: { is_vip?: boolean; vip_expires_at?: string } = {}
        try {
          metadata = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {})
        } catch (e) {
          console.warn('Failed to parse metadata for user:', user.user_id, e)
          metadata = {}
        }
        
        return {
          id: user.user_id,
          username: user.username || 'Unknown User',
          email: user.email || 'No email',
          deleted_at: user.deleted_at,
          deletion_reason: user.deletion_reason || 'User requested deletion',
          coins_at_deletion: user.coins || 0,
          videos_count: user.total_videos || 0,
          referral_count: user.total_referrals || 0,
          avatar_url: user.avatar_url,
          is_vip: metadata.is_vip || false,
          vip_expires_at: metadata.vip_expires_at
        }
      })

      setDeletedUsers(processedUsers)
      calculateStats(processedUsers)
      console.log('Deleted users fetched:', processedUsers.length)
    } catch (error) {
      console.error('Failed to fetch deleted users:', error)
      setDeletedUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (users: DeletedUser[]) => {
    const now = new Date()
    const startOfThisMonth = startOfMonth(now)

    const newStats = {
      total: users.length,
      thisMonth: users.filter(user => {
        const deletedDate = new Date(user.deleted_at)
        return deletedDate >= startOfThisMonth
      }).length
    }

    setStats(newStats)
  }

  const getDateRangeFilter = (filter: string) => {
    const now = new Date()
    switch (filter) {
      case 'this-month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case 'this-year':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'last-year':
        const lastYear = new Date(now.getFullYear() - 1, 0, 1)
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) }
      default:
        return null
    }
  }

  const filteredUsers = deletedUsers.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    if (dateFilter === 'all') return true

    const dateRange = getDateRangeFilter(dateFilter)
    if (!dateRange) return true

    const deletedDate = new Date(user.deleted_at)
    return deletedDate >= dateRange.start && deletedDate <= dateRange.end
  })

  const exportData = () => {
    const csvContent = [
      ['Username', 'Email', 'Deleted At', 'Reason', 'Coins at Deletion'].join(','),
      ...filteredUsers.map(user => [
        user.username,
        user.email,
        format(new Date(user.deleted_at), 'yyyy-MM-dd HH:mm:ss'),
        user.deletion_reason || '',
        user.coins_at_deletion || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deleted-users-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) return

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${selectedUsers.size} user(s) from the database? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Delete selected users from deleted_users table
      const { error } = await supabase
        .from('deleted_users')
        .delete()
        .in('user_id', Array.from(selectedUsers))

      if (error) {
        console.error('Failed to delete users:', error)
        alert('Failed to delete users. Please try again.')
        return
      }

      // Refresh the list and clear selection
      await fetchDeletedUsers()
      setSelectedUsers(new Set())
      alert(`Successfully deleted ${selectedUsers.size} user(s) from the database.`)
    } catch (error) {
      console.error('Failed to delete users:', error)
      alert('Failed to delete users. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Deleted Users
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Track and manage deleted user accounts from mobile app
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchDeletedUsers}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <UserX className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button 
            onClick={exportData}
            variant="outline" 
            size="sm"
            className="flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Only 2 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="gaming-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deleted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="gaming-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Time</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-year">This Year</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-select Actions */}
      {selectedUsers.size > 0 && (
        <Card className="gaming-card border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedUsers.size} user(s) selected
                </span>
              </div>
              <Button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                variant="danger"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Selected'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deleted Users List */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-500" />
              <span>Deleted Users ({filteredUsers.length})</span>
            </div>
            {filteredUsers.length > 0 && (
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                {selectedUsers.size === filteredUsers.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>Select All</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <UserX className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Deleted Users Found
              </h3>
              <p className="text-sm">
                {searchQuery || dateFilter !== 'all' 
                  ? 'No users match your current filters.' 
                  : 'No users have been deleted from the mobile app yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    selectedUsers.has(user.id) 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div className="flex items-center justify-center w-6 h-6">
                    {selectedUsers.has(user.id) ? (
                      <CheckSquare className="w-5 h-5 text-red-500" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.avatar_url ? 'hidden' : ''}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    {user.is_vip && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.username}
                      </p>
                      {user.is_vip && (
                        <div className="flex items-center space-x-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          <span>VIP</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                      {user.email}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(user.deleted_at), { addSuffix: true })}</span>
                      </div>
                      {user.coins_at_deletion !== undefined && user.coins_at_deletion > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>💰 {user.coins_at_deletion} coins</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(user.deleted_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}