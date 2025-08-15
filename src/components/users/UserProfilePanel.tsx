import React, { useState, useEffect } from 'react'
import { X, User, Mail, Coins, Crown, Video, Calendar, Ban, Trash2, Shield, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatNumber, formatCurrency } from '../../lib/utils'
import { format } from 'date-fns'
import { getSupabaseClient } from '../../lib/supabase'

interface UserProfilePanelProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export function UserProfilePanel({ isOpen, onClose, user }: UserProfilePanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails()
    }
  }, [isOpen, user])

  const fetchUserDetails = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Get user's video history
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (videosError) throw videosError

      // Get user's transaction history (if transactions table exists)
      // For now, using the user's existing data
      const userDetails = {
        ...user,
        totalSpentCoins: user.total_spent || 0,
        totalPromotedVideos: videos?.length || 0,
        referralEarnings: 0, // Will be implemented when referral system is ready
        vipExpireTime: user.is_vip && user.vip_expires_at && !isNaN(new Date(user.vip_expires_at).getTime()) ? new Date(user.vip_expires_at) : null,
        purchaseHistory: [], // Will be populated from transactions table when available
        videoHistory: videos?.map(video => ({
          id: video.id,
          title: video.title,
          status: video.status,
          views: video.views_count,
          coins: video.coin_cost,
          date: video.created_at
        })) || [],
        isBanned: user.is_banned || false,
        banReason: user.ban_reason || null,
        banDate: user.ban_date || null
      }

      setUserDetails(userDetails)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      // Use basic user data on error
      setUserDetails({
        ...user,
        totalSpentCoins: user.total_spent || 0,
        totalPromotedVideos: 0,
        referralEarnings: 0,
        vipExpireTime: null,
        purchaseHistory: [],
        videoHistory: [],
        isBanned: false,
        banReason: null,
        banDate: null
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) return null

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'videos', label: 'Videos' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'activity', label: 'Activity' }
  ]

  // Use fetched user details or fallback to basic user data
  const displayUser = userDetails || {
    ...user,
    totalSpentCoins: user.total_spent || 0,
    totalPromotedVideos: 0,
    referralEarnings: 0,
    vipExpireTime: null,
    purchaseHistory: [],
    videoHistory: [],
    isBanned: false,
    banReason: null,
    banDate: null
  }

  const handleDeleteUser = () => {
    console.log('Deleting user:', user.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleBanUser = () => {
    console.log('Banning user:', user.id)
    setShowBanConfirm(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-[500px] z-50 transform transition-transform duration-500 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full gaming-card !rounded-l-2xl !rounded-r-none border-l border-violet-500/30 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-violet-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl gaming-glow">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white gaming-text-shadow flex items-center space-x-2">
                    <span>{user.username}</span>
                    {user.is_vip && <Crown className="w-5 h-5 text-yellow-500" />}
                    {displayUser.isBanned && <Ban className="w-5 h-5 text-red-500" />}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {user.is_vip ? (
                      <Badge variant="vip">VIP User</Badge>
                    ) : (
                      <Badge variant="default">Regular User</Badge>
                    )}
                    {displayUser.isBanned && (
                      <Badge variant="danger">Banned</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="gaming-interactive">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 gaming-card">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatNumber(user.coins)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Current Coins</div>
              </div>
              <div className="text-center p-3 gaming-card">
                <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{displayUser.totalPromotedVideos}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Videos</div>
              </div>
              <div className="text-center p-3 gaming-card">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(displayUser.referralEarnings)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Referrals</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-violet-500/20 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-violet-50/50 dark:bg-violet-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Account Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Coins</label>
                        <p className="font-medium text-orange-600 dark:text-orange-400">{formatNumber(user.coins)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</label>
                        <p className="font-medium">{formatNumber(displayUser.totalSpentCoins)} coins</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Referral Earnings</label>
                        <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatNumber(displayUser.referralEarnings)} coins</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">VIP Status</label>
                        <p className="font-medium">{user.is_vip ? 'Active' : 'Inactive'}</p>
                      </div>
                      {user.is_vip && displayUser.vipExpireTime && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">VIP Expires</label>
                          <p className="font-medium">{format(displayUser.vipExpireTime, 'MMM dd, yyyy')}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</label>
                        <p className="font-medium">{user.created_at && !isNaN(new Date(user.created_at).getTime()) ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</label>
                        <p className="font-medium">{user.last_active && !isNaN(new Date(user.last_active).getTime()) ? format(new Date(user.last_active), 'MMM dd, HH:mm') : 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                {displayUser.videoHistory.map((video) => (
                  <Card key={video.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{video.title}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Video className="w-4 h-4" />
                              <span>{formatNumber(video.views)} views</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Coins className="w-4 h-4" />
                              <span>{formatNumber(video.coins)} coins</span>
                            </span>
                            <span>{video.date && !isNaN(new Date(video.date).getTime()) ? format(new Date(video.date), 'MMM dd') : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {video.status === 'completed' && <Badge variant="success">Completed</Badge>}
                          {video.status === 'active' && <Badge variant="info">Active</Badge>}
                          {video.status === 'deleted' && <Badge variant="danger">Deleted</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                {displayUser.purchaseHistory.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatNumber(purchase.amount)} coins purchased
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {purchase.date && !isNaN(new Date(purchase.date).getTime()) ? format(new Date(purchase.date), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(purchase.price)}
                          </p>
                          <Badge variant="success" className="text-xs">
                            {purchase.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Video promotion completed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Coins purchased</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-violet-500/20">
            <div className="flex space-x-3">
              {!displayUser.isBanned ? (
                <Button 
                  variant="danger" 
                  onClick={() => setShowBanConfirm(true)}
                  className="flex-1"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban User
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  onClick={handleBanUser}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Unban User
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="gaming-card max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{user.username}</strong>? This will permanently remove their account and all associated data.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteUser} className="flex-1">
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="gaming-card max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ban User</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Restrict user access</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to ban <strong>{user.username}</strong>? They will no longer be able to access the platform.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowBanConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleBanUser} className="flex-1">
                Ban User
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
