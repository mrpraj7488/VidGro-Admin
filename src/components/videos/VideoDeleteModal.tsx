import React, { useState } from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'

interface VideoDeleteModalProps {
  video: any
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  userEmail?: string
}

export function VideoDeleteModal({ video, isOpen, onClose, onConfirm, userEmail }: VideoDeleteModalProps) {
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deleteReason.trim()) return

    setIsDeleting(true)
    try {
      await onConfirm(deleteReason.trim())
      setDeleteReason('')
      onClose()
    } catch (error) {
      console.error('Failed to delete video:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setDeleteReason('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="gaming-modal max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Delete Video</h3>
              <p className="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Video Info */}
          <Card className="gaming-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-white line-clamp-2">{video.title}</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>User: {userEmail || 'Unknown User'}</p>
                  <p>Views: {video.views_count} / {video.target_views}</p>
                  <p>Coins Spent: {video.coin_cost}</p>
                  <p>Status: {video.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300">
                <p className="font-medium mb-1">Warning: Permanent Deletion</p>
                <p>This will permanently delete the video promotion. The user may receive a refund based on your platform's refund policy.</p>
              </div>
            </div>
          </div>

          {/* Delete Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Deletion *
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Please provide a reason for deleting this video (e.g., policy violation, inappropriate content, user request, etc.)"
              rows={4}
              required
              className="w-full px-3 py-2 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-violet-500/10 text-white placeholder-gray-400 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              This reason will be logged and may be shared with the user
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-violet-500/20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="danger"
              disabled={isDeleting || !deleteReason.trim()}
              className="flex items-center space-x-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Video</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}