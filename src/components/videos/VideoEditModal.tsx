import React, { useState } from 'react'
import { X, Copy, Eye, ExternalLink, Calendar, User, Link, CheckCircle, Play, Clock, Target } from 'lucide-react'
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
      // Failed to copy
    }
  }

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : url
  }

  const progressPercentage = Math.min(100, (video.views_count / video.target_views) * 100)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="gaming-modal w-full max-w-md mx-2 max-h-[95vh] overflow-y-auto">
        {/* Header - Simplified */}
        <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm gaming-glow flex-shrink-0">
              {(userEmail || userName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white truncate">{userName || 'Unknown User'}</h2>
              <p className="text-sm text-gray-400 truncate">{userEmail || 'No email'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Video Title & Status */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white line-clamp-2 leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className={`inline-flex px-3 py-1 rounded-lg font-medium text-sm ${getStatusColor(video.status)}`}>
                {video.status.charAt(0).toUpperCase() + video.status.slice(1).replace('_', ' ')}
              </div>
              <div className="text-sm text-gray-400">
                {format(new Date(video.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          {/* Key Metrics - Simplified Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-violet-500/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-violet-400">{formatNumber(video.views_count)}</div>
              <div className="text-xs text-violet-400">Current Views</div>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-emerald-400">{formatNumber(video.target_views)}</div>
              <div className="text-xs text-emerald-400">Target Views</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="font-medium text-white">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 text-center">
              {formatNumber(video.target_views - video.views_count)} views remaining
            </div>
          </div>

          {/* YouTube URL - Compact */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              YouTube Video
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-violet-500/10 border border-violet-500/30 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm font-mono text-white truncate">
                    {extractVideoId(video.youtube_url)}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(video.youtube_url, 'url')}
                className="flex-shrink-0"
              >
                {copiedItem === 'url' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Essential Details - Compact */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-orange-500/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-medium">Coins Spent</span>
              </div>
              <div className="text-lg font-bold text-white">{formatNumber(video.coin_cost)}</div>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Completion</span>
              </div>
              <div className="text-lg font-bold text-white">{video.completion_rate || 0}%</div>
            </div>
          </div>

          {/* Actions - Mobile Optimized */}
          <div className="flex flex-col space-y-2 pt-4 border-t border-violet-500/20">
            <Button 
              onClick={handleOpenYouTube}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open on YouTube</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleCopy(video.youtube_url, 'full-url')}
                className="flex-1 flex items-center justify-center space-x-2"
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
              
              {onDelete && (
                <Button 
                  variant="danger" 
                  onClick={() => onDelete(video)}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}