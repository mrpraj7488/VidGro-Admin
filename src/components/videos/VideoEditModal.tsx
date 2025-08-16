import React, { useState } from 'react'
import { X, Copy, Eye, TrendingUp, Coins, Calendar, User, Mail, ExternalLink, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'
import { getSupabaseAdminClient } from '../../lib/supabase'

interface VideoEditModalProps {
  video: any
  isOpen: boolean
  onClose: () => void
  onVideoUpdate?: () => void
}

export function VideoEditModal({ video, isOpen, onClose, onVideoUpdate }: VideoEditModalProps) {
  const { copyToClipboard } = useAdminStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

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

  if (!isOpen || !video) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
      case 'completed': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
      case 'on_hold': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      case 'paused': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      case 'pending': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'repromoted': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
      case 'deleted': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      case 'rejected': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  const handleDeleteVideo = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion')
      return
    }

    setIsDeleting(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase Admin not initialized')
      }

      // Log the deletion with reason
      await supabase.from('video_deletions').insert({
        video_id: video.id,
        user_id: video.user_id,
        video_title: video.title,
        coin_cost: video.coin_cost,
        deletion_reason: deleteReason,
        deleted_by: 'admin',
        refund_amount: video.coin_cost,
        refund_percentage: 100
      })

      // Update video status to deleted
      const { error } = await supabase
        .from('videos')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id)

      if (error) throw error

      // Optionally refund coins to user
      await supabase.rpc('adjust_user_coins', {
        user_id: video.user_id,
        coin_amount: video.coin_cost,
        adjustment_reason: `Video deletion refund: ${deleteReason}`
      })

      setShowDeleteConfirm(false)
      setDeleteReason('')
      onClose()
      onVideoUpdate?.()
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('Failed to delete video. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'actions', label: 'Actions' }
  ]

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="gaming-modal w-full max-w-4xl max-h-[95vh] overflow-hidden">
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-violet-500/20">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">Video Details</h2>
              <p className="text-xs sm:text-sm text-gray-400 truncate">{video.title}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>

          {/* Tabs - Scrollable on Mobile */}
          <div className="flex border-b border-violet-500/20 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-900/20'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* User Information */}
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>User Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Username</label>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={video.username}
                              readOnly
                              className="!bg-violet-500/10 text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(video.username)}
                              className="p-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={video.user_email}
                              readOnly
                              className="!bg-violet-500/10 text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(video.user_email)}
                              className="p-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Video Information */}
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white text-sm sm:text-base">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Video Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">YouTube URL</label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={video.youtube_url}
                            readOnly
                            className="!bg-violet-500/10 font-mono text-xs sm:text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(video.youtube_url, '_blank')}
                            className="p-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Status</label>
                          <div className={`px-3 py-2 rounded-lg font-medium text-sm ${getStatusColor(video.status)}`}>
                            {video.status.charAt(0).toUpperCase() + video.status.slice(1).replace('_', ' ')}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
                          <div className="px-3 py-2 gaming-card">
                            <span className="font-mono text-sm text-blue-400">
                              {Math.floor(video.duration_seconds / 60)}m {video.duration_seconds % 60}s
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="gaming-metric p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold text-violet-400">{formatNumber(video.views_count)}</div>
                      <div className="text-xs text-violet-400">Current Views</div>
                    </div>
                    <div className="gaming-metric p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold text-emerald-400">{video.completion_rate}%</div>
                      <div className="text-xs text-emerald-400">Completion</div>
                    </div>
                    <div className="gaming-metric p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold text-orange-400">{formatNumber(video.coin_cost)}</div>
                      <div className="text-xs text-orange-400">Coins Spent</div>
                    </div>
                    <div className="gaming-metric p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-400">
                        {Math.floor(video.total_watch_time / 60)}m
                      </div>
                      <div className="text-xs text-blue-400">Watch Time</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  {/* Progress Overview */}
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-white text-sm sm:text-base">Progress Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">View Progress</span>
                          <span className="font-medium text-white">
                            {formatNumber(video.views_count)} / {formatNumber(video.target_views)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(video.views_count, video.target_views)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                          {getProgressPercentage(video.views_count, video.target_views).toFixed(1)}% complete
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Analytics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="gaming-card">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-400 mb-1">
                            {video.completion_rate}%
                          </div>
                          <div className="text-sm text-gray-400">Completion Rate</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Industry avg: 65%
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="gaming-card">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {Math.floor(video.total_watch_time / video.views_count || 0)}s
                          </div>
                          <div className="text-sm text-gray-400">Avg Watch Time</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Per view
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline */}
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-white text-sm sm:text-base">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-violet-500/10 rounded-lg">
                          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Video Created</p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(video.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        
                        {video.status === 'completed' && (
                          <div className="flex items-center space-x-3 p-3 bg-emerald-500/10 rounded-lg">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">Promotion Completed</p>
                              <p className="text-xs text-gray-400">Target views reached</p>
                            </div>
                          </div>
                        )}
                        
                        {video.repromoted_at && (
                          <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">Repromoted</p>
                              <p className="text-xs text-gray-400">
                                {format(new Date(video.repromoted_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Actions Tab */}
              {activeTab === 'actions' && (
                <div className="space-y-4">
                  {/* Quick Actions */}
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-white text-sm sm:text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => window.open(video.youtube_url, '_blank')}
                          className="flex items-center space-x-2 justify-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View on YouTube</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(video.youtube_url)}
                          className="flex items-center space-x-2 justify-center"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy URL</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="gaming-card border-red-500/50 bg-red-900/20">
                    <CardHeader>
                      <CardTitle className="text-red-400 text-sm sm:text-base flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Danger Zone</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-red-300">
                          Deleting this video will remove it from the platform and refund coins to the user.
                        </p>
                        <Button
                          variant="danger"
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={video.status === 'deleted'}
                          className="w-full flex items-center space-x-2 justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{video.status === 'deleted' ? 'Already Deleted' : 'Delete Video'}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-violet-500/20">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="gaming-modal max-w-md w-full mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Video</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 mb-4 text-sm">
                  Are you sure you want to delete "<strong className="text-white">{video.title}</strong>"?
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  This will refund {formatNumber(video.coin_cost)} coins to {video.username}.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deletion Reason *
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Please provide a reason for deleting this video..."
                    rows={3}
                    className="w-full px-3 py-2 border border-red-500/30 rounded-lg bg-red-500/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteReason('')
                  }} 
                  className="flex-1 text-sm"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDeleteVideo} 
                  className="flex-1 text-sm"
                  disabled={isDeleting || !deleteReason.trim()}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Video
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