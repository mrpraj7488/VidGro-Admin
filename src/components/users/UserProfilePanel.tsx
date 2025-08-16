import React, { useState, useEffect } from 'react'
import { X, User, Mail, Coins, Crown, Video, Calendar, Ban, Trash2, Shield, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatNumber, formatCurrency } from '../../lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { getSupabaseClient } from '../../lib/supabase'

interface UserProfilePanelProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onDeleteUser?: (userId: string) => Promise<void>
  onBanUser?: (userId: string, reason?: string) => Promise<void>
  actionLoading?: Record<string, boolean>
}

export function UserProfilePanel({ isOpen, onClose, user, onDeleteUser, onBanUser, actionLoading = {} }: UserProfilePanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Dispatch popup state events
  React.useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
    }
    return () => {
      if (isOpen) {
        window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: false } }))
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails()
    }
  }, [isOpen, user])

  const fetchUserDetails = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Get user's video history
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (videosError) {
        console.error('Failed to fetch user videos:', videosError)
      }

      // Get user's transaction history
      const { data: userTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsError) {
        console.error('Failed to fetch user transactions:', transactionsError)
      }

      const userDetails = {
        ...user,
        totalSpentCoins: userTransactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) || user.total_spent || 0,
        totalPromotedVideos: videos?.length || 0,
        referralEarnings: userTransactions?.filter(t => t.transaction_type === 'referral_reward').reduce((sum, t) => sum + t.amount, 0) || 0,
        vipExpireTime: user.is_vip && user.vip_expires_at && !isNaN(new Date(user.vip_expires_at).getTime()) ? new Date(user.vip_expires_at) : null,
        purchaseHistory: userTransactions?.filter(t => t.transaction_type === 'coin_purchase').map(tx => ({
          id: tx.id,
          amount: tx.amount,
          price: tx.amount * 0.01, // Assuming 1 cent per coin
          status: 'completed',
          date: tx.created_at
        })) || [],
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
      console.log('User details fetched:', {
        userId: user.id,
        videosCount: videos?.length || 0,
        transactionsCount: userTransactions?.length || 0,
        totalSpent: userDetails.totalSpentCoins,
        referralEarnings: userDetails.referralEarnings
      })
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

  const handleDeleteUser = async () => {
    if (onDeleteUser) {
      await onDeleteUser(user.id)
    }
    setShowDeleteConfirm(false)
  }

  const handleBanUser = async () => {
    if (onBanUser) {
      await onBanUser(user.id, banReason || 'Banned by admin')
    }
    setShowBanConfirm(false)
    setBanReason('')
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] lg:w-[500px] z-50 transform transition-transform duration-500 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full gaming-card !rounded-l-2xl !rounded-r-none border-l border-violet-500/30 shadow-2xl">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-violet-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl gaming-glow">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white gaming-text-shadow flex items-center space-x-2">
                    <span>{user.username}</span>
                    {user.is_vip && <Crown className="w-5 h-5 text-yellow-500" />}
                    {displayUser.isBanned && <Ban className="w-5 h-5 text-red-500" />}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {user.is_vip ? (
                      <Badge variant="vip" className="text-xs">VIP User</Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">Regular User</Badge>
                    )}
                    {displayUser.isBanned && (
                      <Badge variant="danger" className="text-xs">Banned</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="gaming-interactive">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center p-3 gaming-card">
                <div className="text-base md:text-lg font-bold text-orange-600 dark:text-orange-400">{formatNumber(user.coins)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Current Coins</div>
              </div>
              <div className="text-center p-3 gaming-card">
                <div className="text-base md:text-lg font-bold text-violet-600 dark:text-violet-400">{displayUser.totalPromotedVideos}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Videos</div>
              </div>
              <div className="text-center p-3 gaming-card">
                <div className="text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(displayUser.referralEarnings)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Referrals</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-violet-500/20 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
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
          <div className="flex-1 overflow-y-auto p-4 md:p-6 gaming-scrollbar">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Account Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Current Coins</label>
                        <p className="font-medium text-sm md:text-base text-orange-600 dark:text-orange-400">{formatNumber(user.coins)}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</label>
                        <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{formatNumber(displayUser.totalSpentCoins)} coins</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Referral Earnings</label>
                        <p className="font-medium text-sm md:text-base text-emerald-600 dark:text-emerald-400">{formatNumber(displayUser.referralEarnings)} coins</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">VIP Status</label>
                        <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{user.is_vip ? 'Active' : 'Inactive'}</p>
                      </div>
                      {user.is_vip && displayUser.vipExpireTime && (
                        <div>
                          <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">VIP Expires</label>
                          <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{format(displayUser.vipExpireTime, 'MMM dd, yyyy')}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Joined</label>
                        <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{user.created_at && !isNaN(new Date(user.created_at).getTime()) ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</label>
                        <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{user.last_active && !isNaN(new Date(user.last_active).getTime()) ? format(new Date(user.last_active), 'MMM dd, HH:mm') : 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                {displayUser.videoHistory.length > 0 ? (
                  displayUser.videoHistory.map((video) => (
                    <Card key={video.id} className="gaming-card hover:scale-[1.01] transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">{video.title}</h4>
                            <div className="flex items-center space-x-3 md:space-x-4 mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Video className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{formatNumber(video.views)} views</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Coins className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{formatNumber(video.coins)} coins</span>
                              </span>
                              <span>{video.date && !isNaN(new Date(video.date).getTime()) ? format(new Date(video.date), 'MMM dd') : 'N/A'}</span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            {video.status === 'completed' && <Badge variant="success" className="text-xs">Completed</Badge>}
                            {video.status === 'active' && <Badge variant="info" className="text-xs">Active</Badge>}
                            {video.status === 'deleted' && <Badge variant="danger" className="text-xs">Deleted</Badge>}
                            {video.status === 'pending' && <Badge variant="warning" className="text-xs">Pending</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="gaming-card">
                    <CardContent className="p-8 text-center">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Videos</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This user hasn't promoted any videos yet
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                {displayUser.purchaseHistory.length > 0 ? (
                  displayUser.purchaseHistory.map((purchase) => (
                    <Card key={purchase.id} className="gaming-card hover:scale-[1.01] transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                                {formatNumber(purchase.amount)} coins purchased
                              </p>
                              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                {purchase.date && !isNaN(new Date(purchase.date).getTime()) ? format(new Date(purchase.date), 'MMM dd, yyyy') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                              {formatCurrency(purchase.price)}
                            </p>
                            <Badge variant="success" className="text-xs">
                              {purchase.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="gaming-card">
                    <CardContent className="p-8 text-center">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transactions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This user hasn't made any purchases yet
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <Card className="gaming-card hover:scale-[1.01] transition-all duration-300">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Account created</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.created_at && !isNaN(new Date(user.created_at).getTime()) ? 
                              formatDistanceToNow(new Date(user.created_at)) + ' ago' : 'Unknown'}
                          </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                
                {user.is_vip && (
                  <Card className="gaming-card hover:scale-[1.01] transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">VIP status activated</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Premium features enabled</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {displayUser.totalPromotedVideos > 0 && (
                  <Card className="gaming-card hover:scale-[1.01] transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Promoted {displayUser.totalPromotedVideos} video{displayUser.totalPromotedVideos !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Video promotion activity</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {displayUser.purchaseHistory.length > 0 && (
                  <Card className="gaming-card hover:scale-[1.01] transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Coins purchased</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {displayUser.purchaseHistory.length} transaction{displayUser.purchaseHistory.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Show empty state if no activity */}
                {!user.is_vip && displayUser.totalPromotedVideos === 0 && displayUser.purchaseHistory.length === 0 && (
                  <Card className="gaming-card">
                    <CardContent className="p-8 text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recent Activity</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        User activity will appear here as they use the platform
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-violet-500/20 bg-violet-500/5">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {!displayUser.isBanned ? (
                <Button 
                  variant="danger" 
                  onClick={() => setShowBanConfirm(true)}
                  disabled={actionLoading[`ban-${user.id}`]}
                  className="flex-1 text-sm"
                >
                  {actionLoading[`ban-${user.id}`] ? (
                    <>
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Banning...
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  onClick={() => handleBanUser()}
                  disabled={actionLoading[`ban-${user.id}`]}
                  className="flex-1 text-sm"
                >
                  {actionLoading[`ban-${user.id}`] ? (
                    <>
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Unbanning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Unban User
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={actionLoading[`delete-${user.id}`]}
                className="flex-1 text-sm"
              >
                {actionLoading[`delete-${user.id}`] ? (
                  <>
                    <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="gaming-modal max-w-md w-full mx-4">
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete User</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 text-sm md:text-base">
                Are you sure you want to delete <strong className="text-white">{user.username}</strong>? This will permanently remove their account and all associated data.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="flex-1 text-sm"
                  disabled={actionLoading[`delete-${user.id}`]}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDeleteUser} 
                  className="flex-1 text-sm"
                  disabled={actionLoading[`delete-${user.id}`]}
                >
                  {actionLoading[`delete-${user.id}`] ? (
                    <>
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="gaming-modal max-w-md w-full mx-4">
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Ban className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {displayUser.isBanned ? 'Unban User' : 'Ban User'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {displayUser.isBanned ? 'Restore user access' : 'Restrict user access'}
                  </p>
                </div>
              </div>
              
              {!displayUser.isBanned && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ban Reason
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter reason for banning this user..."
                    rows={3}
                    className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-white placeholder-gray-400 text-sm"
                  />
                </div>
              )}
              
              <p className="text-gray-300 mb-6 text-sm md:text-base">
                {displayUser.isBanned ? (
                  <>Are you sure you want to unban <strong className="text-white">{user.username}</strong>? They will regain access to the platform.</>
                ) : (
                  <>Are you sure you want to ban <strong className="text-white">{user.username}</strong>? They will no longer be able to access the platform.</>
                )}
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBanConfirm(false)
                    setBanReason('')
                  }} 
                  className="flex-1 text-sm"
                  disabled={actionLoading[`ban-${user.id}`]}
                >
                  Cancel
                </Button>
                <Button 
                  variant={displayUser.isBanned ? "success" : "danger"}
                  onClick={handleBanUser} 
                  className="flex-1 text-sm"
                  disabled={actionLoading[`ban-${user.id}`] || (!displayUser.isBanned && !banReason.trim())}
                >
                  {actionLoading[`ban-${user.id}`] ? (
                    <>
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {displayUser.isBanned ? 'Unbanning...' : 'Banning...'}
                    </>
                  ) : (
                    <>
                      {displayUser.isBanned ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Unban User
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Ban User
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}