import React, { useState, useEffect } from 'react'
import { X, Copy, Eye, TrendingUp, DollarSign, Trash2, ExternalLink } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
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


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="gaming-modal max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <div>
            <h2 className="text-xl font-bold text-white">Video Details</h2>
            <p className="text-sm text-gray-400">View video promotion information</p>
          </div>
          <div className="flex items-center space-x-3">
            {onDelete && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => onDelete(video)}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="gaming-card p-3 text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((video.views_count / video.target_views) * 100)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</div>
            </div>
            <div className="gaming-card p-3 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(video.views_count)}/{formatNumber(video.target_views)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
            </div>
          </div>

          {/* User Info */}
          <div className="gaming-card p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">User Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Name:</span>
                <span className="text-sm text-white">{userName || 'Unknown User'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Email:</span>
                <span className="text-sm text-white">{userEmail || 'Unknown Email'}</span>
              </div>
            </div>
          </div>

          {/* Video URL */}
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

          {/* Video Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Status
            </label>
            <div className={`px-3 py-2 rounded-lg font-medium text-sm ${getStatusColor(video.status)}`}>
              {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
            </div>
          </div>

          {/* Spent Coins */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Spent Coins
            </label>
            <div className="px-3 py-2 gaming-card">
              <span className="font-mono text-sm text-orange-400">{formatNumber(video.coin_cost)}</span>
            </div>
          </div>

          {/* View Progress */}
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

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Footer */}
        <div className="flex items-center justify-end p-4 sm:p-6 border-t border-violet-500/20">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}