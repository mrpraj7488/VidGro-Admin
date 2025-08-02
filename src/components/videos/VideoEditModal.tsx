import React, { useState, useEffect } from 'react'
import { X, Copy, Eye, TrendingUp, DollarSign } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { formatNumber } from '../../lib/utils'

interface VideoEditModalProps {
  video: any
  isOpen: boolean
  onClose: () => void
}

export function VideoEditModal({ video, isOpen, onClose }: VideoEditModalProps) {
  const { copyToClipboard } = useAdminStore()

  if (!isOpen || !video) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
      case 'completed': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
      case 'hold': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      case 'repromote': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
      case 'deleted': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="gaming-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <div>
            <h2 className="text-xl font-bold text-white">Video Details</h2>
            <p className="text-sm text-gray-400">View video promotion information</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Preview */}
          <div className="flex items-start space-x-4 p-4 gaming-card">
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-24 h-16 object-cover rounded-lg shadow-sm"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">{video.title}</h3>
              <p className="text-sm text-gray-400">by {video.username}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-400 flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {formatNumber(video.views_count)} views
                </span>
                <span className="text-xs text-gray-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {video.completion_rate}% completion
                </span>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={video.video_url}
                    readOnly
                    className="!bg-violet-500/10 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(video.video_url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <Input
                  value={video.title}
                  readOnly
                  className="!bg-violet-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Criteria
                </label>
                <div className="px-3 py-2 gaming-card">
                  <Badge variant="default" className="font-mono text-sm">{video.current_views}/{video.target_views}</Badge>
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
                  <span className="font-mono text-sm text-orange-400">{formatNumber(video.spent_coins)}</span>
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
                  Total Watch Time (seconds)
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="font-mono text-sm text-blue-400">{Math.floor(video.total_watch_time / 60)}m {video.total_watch_time % 60}s</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Completion Rate (%)
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="font-mono text-sm text-emerald-400">{video.completion_rate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="gaming-metric p-4 text-center">
              <div className="gaming-metric-value !text-2xl">{formatNumber(video.views_count)}</div>
              <div className="text-sm text-violet-400">Total Views</div>
            </div>
            <div className="gaming-metric p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{video.completion_rate}%</div>
              <div className="text-sm text-emerald-400">Completion Rate</div>
            </div>
            <div className="gaming-metric p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{formatNumber(video.spent_coins)}</div>
              <div className="text-sm text-orange-400">Coins Spent</div>
            </div>
            <div className="gaming-metric p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.floor(video.total_watch_time / 60)}m</div>
              <div className="text-sm text-blue-400">Watch Time</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-violet-500/20 gaming-card">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}