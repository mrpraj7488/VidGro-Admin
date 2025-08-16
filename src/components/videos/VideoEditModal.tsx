import React, { useState, useEffect } from 'react'
import { X, Copy, Eye, TrendingUp, DollarSign, Trash2, ExternalLink, Calendar, User } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

interface VideoEditModalProps {
  video: any
  isOpen: boolean
  onClose: () => void
  onDelete?: (video: any) => void
  userEmail?: string
}

export function VideoEditModal({ video, isOpen, onClose, onDelete, userEmail }: VideoEditModalProps) {
  const { copyToClipboard } = useAdminStore()

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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="gaming-modal max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-violet-500/20">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">Video Details</h2>
            <p className="text-sm text-gray-400">View video promotion information</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Video Header */}
          <Card className="gaming-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatNumber(video.views_count)} / {formatNumber(video.target_views)} views
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {video.completion_rate || 0}% completion
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(video.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenYouTube}
                  className="flex items-center space-x-2 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>YouTube</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Email
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={userEmail || 'Unknown User'}
                    readOnly
                    className="!bg-violet-500/10 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userEmail || '')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={video.youtube_url}
                    readOnly
                    className="!bg-violet-500/10 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(video.youtube_url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  View Progress
                </label>
                <div className="px-3 py-2 gaming-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-white">
                      {Math.round((video.views_count / video.target_views) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (video.views_count / video.target_views) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Spent Coins
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="font-mono text-sm text-orange-400">{formatNumber(video.coin_cost)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Status
                </label>
                <div className={`px-3 py-2 rounded-lg font-medium text-sm ${getStatusColor(video.status)}`}>
                  {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
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

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="gaming-metric p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-violet-400">{formatNumber(video.views_count)}</div>
              <div className="text-xs sm:text-sm text-violet-400">Total Views</div>
            </div>
            <div className="gaming-metric p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{video.completion_rate || 0}%</div>
              <div className="text-xs sm:text-sm text-emerald-400">Completion Rate</div>
            </div>
            <div className="gaming-metric p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{formatNumber(video.coin_cost)}</div>
              <div className="text-xs sm:text-sm text-orange-400">Coins Spent</div>
            </div>
            <div className="gaming-metric p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{Math.floor((video.total_watch_time || 0) / 60)}m</div>
              <div className="text-xs sm:text-sm text-blue-400">Watch Time</div>
            </div>
          </div>

          {/* Video Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                    onClick={() => copyToClipboard(video.id)}
                  >
                    <Copy className="w-4 h-4" />
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
                    onClick={() => copyToClipboard(video.user_id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-violet-500/20 gaming-card">
          <Button 
            variant="outline" 
            onClick={handleOpenYouTube}
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on YouTube</span>
          </Button>
          {onDelete && (
            <Button 
              variant="danger" 
              onClick={() => onDelete(video)}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Video</span>
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}