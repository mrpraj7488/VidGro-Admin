import React, { useState, useEffect } from 'react'
import { X, Copy, Save, Eye, TrendingUp, DollarSign } from 'lucide-react'
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
  const { updateVideoStatus, processRefund, copyToClipboard } = useAdminStore()
  const [editedVideo, setEditedVideo] = useState(video || {})
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundPercent, setRefundPercent] = useState(0)

  useEffect(() => {
    if (video) {
      setEditedVideo(video)
      setRefundAmount(video.refund_amount || 0)
      setRefundPercent(video.refund_percent || 0)
    }
  }, [video])

  if (!isOpen || !video) return null

  const handleSave = async () => {
    await updateVideoStatus(video.video_id, editedVideo.status)
    if (editedVideo.status === 'deleted' && (refundAmount > 0 || refundPercent > 0)) {
      await processRefund(video.video_id, refundAmount, refundPercent)
    }
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      case 'hold': return 'text-orange-600 bg-orange-50'
      case 'repromote': return 'text-purple-600 bg-purple-50'
      case 'deleted': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="gaming-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <div>
            <h2 className="text-xl font-bold text-white gaming-glow">Edit Video Details</h2>
            <p className="text-sm text-gray-400">Manage video promotion settings and status</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white gaming-glow" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Preview */}
          <div className="flex items-start space-x-4 p-4 gaming-card">
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-24 h-16 object-cover rounded-lg shadow-sm gaming-glow"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1 gaming-glow">{video.title}</h3>
              <p className="text-sm text-gray-400">by {video.username}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-400 flex items-center">
                  <Eye className="w-3 h-3 mr-1 gaming-glow" />
                  {formatNumber(video.views_count)} views
                </span>
                <span className="text-xs text-gray-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1 gaming-glow" />
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
                    <Copy className="w-4 h-4 gaming-glow" />
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
                    <Copy className="w-4 h-4 gaming-glow" />
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
                  <Badge variant="default" className="font-mono text-sm">{video.view_criteria}</Badge>
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
                  <span className="font-mono text-sm text-orange-400 gaming-glow">{formatNumber(video.spent_coins)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Status
                </label>
                <select
                  value={editedVideo.status}
                  onChange={(e) => setEditedVideo({ ...editedVideo, status: e.target.value })}
                  className={`gaming-input w-full ${getStatusColor(editedVideo.status)} font-medium`}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="hold">On Hold</option>
                  <option value="repromote">Repromote</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Watch Time (seconds)
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="font-mono text-sm text-blue-400 gaming-glow">{Math.floor(video.total_watch_time / 60)}m {video.total_watch_time % 60}s</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Completion Rate (%)
                </label>
                <div className="px-3 py-2 gaming-card">
                  <span className="font-mono text-sm text-emerald-400 gaming-glow">{video.completion_rate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Section (only for deleted videos) */}
          {editedVideo.status === 'deleted' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-900/20 dark:border-red-800/50">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Refund Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                    Refund Amount (coins)
                  </label>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="border-red-300 focus:border-red-500 dark:border-red-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                    Refund Percentage (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={refundPercent}
                    onChange={(e) => setRefundPercent(Number(e.target.value))}
                    className="border-red-300 focus:border-red-500 dark:border-red-700"
                  />
                </div>
              </div>
              {(video.refund_amount || video.refund_percent) && (
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                  <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">Current Refund Status:</h5>
                  <div className="flex items-center space-x-4 text-sm">
                    {video.refund_amount && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {formatNumber(video.refund_amount)} coins refunded
                      </span>
                    )}
                    {video.refund_percent && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {video.refund_percent}% refund applied
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="gaming-metric p-4 text-center">
              <div className="gaming-metric-value !text-2xl">{formatNumber(video.views_count)}</div>
              <div className="text-sm text-violet-400">Total Views</div>
            </div>
            <div className="gaming-metric p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400 gaming-glow">{video.completion_rate}%</div>
              <div className="text-sm text-emerald-400">Completion Rate</div>
            </div>
            <div className="gaming-metric p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 gaming-glow">{formatNumber(video.spent_coins)}</div>
              <div className="text-sm text-orange-400">Coins Spent</div>
            </div>
            <div className="gaming-metric p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 gaming-glow">{Math.floor(video.total_watch_time / 60)}m</div>
              <div className="text-sm text-blue-400">Watch Time</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-violet-500/20 gaming-card">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4 gaming-glow" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    </div>
  )
}