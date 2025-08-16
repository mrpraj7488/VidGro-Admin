import React, { useState, useEffect } from 'react'
import { X, Copy, Eye, TrendingUp, DollarSign, Trash2, ExternalLink, Calendar, User, Link, CheckCircle, Play } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

interface VideoEditModalProps {
  video: any
  isOpen: boolean
  onClose: () => void
  onDelete?: (video: any) => void
  userEmail?: string
  userName?: string
}

export function VideoEditModal({ video, isOpen, onClose, onDelete, userEmail, userName }: VideoEditModalProps) {
  const { copyToClipboard } = useAdminStore()
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

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
      case 'repromoted': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
      case 'deleted': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const handleOpenYouTube = () => {
    window.open(video.youtube_url, '_blank')
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      await copyToClipboard(text)
      setCopiedItem(type)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : url
  }

  const progressPercentage = Math.min(100, (video.views_count / video.target_views) * 100)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="gaming-modal max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-violet-500/20">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">Video Details</h2>
            <p className="text-sm text-gray-400">Comprehensive video promotion information</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleOpenYouTube}
              className="hidden sm:flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>YouTube</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* User Information Card */}
          <Card className="gaming-card border-violet-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg gaming-glow">
                  {(userEmail || userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{userName || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-400">{userEmail || 'No email available'}</p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Video Header Card */}
          <Card className="gaming-card border-blue-500/30">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Video Title */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                  <div className={`inline-flex px-3 py-1 rounded-lg font-medium text-sm ${getStatusColor(video.status)}`}>
                    {video.status.charAt(0).toUpperCase() + video.status.slice(1).replace('_', ' ')}
                  </div>
                </div>

                {/* Video URL - Enhanced Copyable Format */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    YouTube Video URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-violet-500/10 border border-violet-500/30 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <Link className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-white truncate">{video.youtube_url}</p>
                          <p className="text-xs text-gray-400 mt-1">Video ID: {extractVideoId(video.youtube_url)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(video.youtube_url, 'url')}
                        className="flex items-center space-x-2"
                      >
                        {copiedItem === 'url' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Copy</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenYouTube}
                        className="flex items-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Open</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="gaming-metric p-3 sm:p-4 text-center border-violet-500/30">
              <div className="text-xl sm:text-2xl font-bold text-violet-400">{formatNumber(video.views_count)}</div>
              <div className="text-xs sm:text-sm text-violet-400">Current Views</div>
            </Card>
            <Card className="gaming-metric p-3 sm:p-4 text-center border-emerald-500/30">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{formatNumber(video.target_views)}</div>
              <div className="text-xs sm:text-sm text-emerald-400">Target Views</div>
            </Card>
            <Card className="gaming-metric p-3 sm:p-4 text-center border-blue-500/30">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{video.completion_rate || 0}%</div>
              <div className="text-xs sm:text-sm text-blue-400">Completion Rate</div>
            </Card>
            <Card className="gaming-metric p-3 sm:p-4 text-center border-orange-500/30">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{formatNumber(video.coin_cost)}</div>
              <div className="text-xs sm:text-sm text-orange-400">Coins Spent</div>
            </Card>
          </div>

          {/* Progress Visualization */}
          <Card className="gaming-card border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>View Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium text-white">
                    {Math.round(progressPercentage)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-600 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-400">{formatNumber(video.views_count)}</div>
                    <div className="text-gray-400">Current Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{formatNumber(video.target_views - video.views_count)}</div>
                    <div className="text-gray-400">Remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Information Grid - Mobile Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video ID
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={video.id}
                    readOnly
                    className="!bg-violet-500/10 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(video.id, 'video-id')}
                  >
                    {copiedItem === 'video-id' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User ID
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={video.user_id}
                    readOnly
                    className="!bg-violet-500/10 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(video.user_id, 'user-id')}
                  >
                    {copiedItem === 'user-id' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube Video ID
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={extractVideoId(video.youtube_url)}
                    readOnly
                    className="!bg-violet-500/10 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(extractVideoId(video.youtube_url), 'youtube-id')}
                  >
                    {copiedItem === 'youtube-id' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Created Date
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="text-sm text-gray-300">
                    {format(new Date(video.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Updated
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="text-sm text-gray-300">
                    {format(new Date(video.updated_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Watch Time
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="font-mono text-sm text-blue-400">
                    {Math.floor((video.total_watch_time || 0) / 60)}m {(video.total_watch_time || 0) % 60}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Video URL Card - Mobile Optimized */}
          <Card className="gaming-card border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Link className="w-5 h-5 text-blue-400" />
                <span>Complete Video URL</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 w-full">
                    <p className="font-mono text-sm text-blue-300 break-all">{video.youtube_url}</p>
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(video.youtube_url, 'full-url')}
                      className="flex items-center space-x-2 flex-1 sm:flex-none"
                    >
                      {copiedItem === 'full-url' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenYouTube}
                      className="flex items-center space-x-2 flex-1 sm:flex-none sm:hidden"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analytics - Mobile Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* View Analytics */}
            <Card className="gaming-card border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <span>View Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-400">{formatNumber(video.views_count)}</div>
                      <div className="text-xs text-emerald-400">Current Views</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{formatNumber(video.target_views)}</div>
                      <div className="text-xs text-blue-400">Target Views</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="gaming-card border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                  <span>Financial Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                      <span className="text-sm text-gray-300">Coins Spent</span>
                      <span className="font-mono text-lg font-bold text-orange-400">{formatNumber(video.coin_cost)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-sm text-gray-300">Coins Earned</span>
                      <span className="font-mono text-lg font-bold text-purple-400">{formatNumber(video.coins_earned_total || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                      <span className="text-sm text-gray-300">Watch Time</span>
                      <span className="font-mono text-lg font-bold text-blue-400">
                        {Math.floor((video.total_watch_time || 0) / 60)}m {(video.total_watch_time || 0) % 60}s
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details - Mobile Responsive */}
          <Card className="gaming-card border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-white">Technical Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Duration</label>
                  <div className="text-sm text-white font-mono">
                    {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}` : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Completion Rate</label>
                  <div className="text-sm text-white font-mono">{video.completion_rate || 0}%</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                  <div className="text-sm text-white">{video.status.replace('_', ' ')}</div>
                </div>
                {video.hold_until && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Hold Until</label>
                    <div className="text-sm text-white">{format(new Date(video.hold_until), 'MMM dd, yyyy HH:mm')}</div>
                  </div>
                )}
                {video.completed_at && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Completed At</label>
                    <div className="text-sm text-white">{format(new Date(video.completed_at), 'MMM dd, yyyy HH:mm')}</div>
                  </div>
                )}
                {video.repromoted_at && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Repromoted At</label>
                    <div className="text-sm text-white">{format(new Date(video.repromoted_at), 'MMM dd, yyyy HH:mm')}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-violet-500/20 gaming-card">
          <Button 
            variant="outline" 
            onClick={handleOpenYouTube}
            className="flex items-center space-x-2 w-full sm:w-auto order-2 sm:order-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on YouTube</span>
          </Button>
          {onDelete && (
            <Button 
              variant="danger" 
              onClick={() => onDelete(video)}
              className="flex items-center space-x-2 w-full sm:w-auto order-3 sm:order-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Video</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto order-1 sm:order-3"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

function extractVideoId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : url
}