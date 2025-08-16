import React, { useEffect, useState } from 'react'
import { Search, Eye, TrendingUp, Calendar, MoreHorizontal, Copy, Trash2 } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { VideoEditModal } from './VideoEditModal'
import { VideoDeleteModal } from './VideoDeleteModal'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

export function VideoManagement() {
  const { videos, videoFilters, isLoading, fetchVideos, setVideoFilters, copyToClipboard } = useAdminStore()
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState(null)
  const [userEmails, setUserEmails] = useState<Record<string, string>>({})
  const [userNames, setUserNames] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchVideos()
    fetchUserData()
  }, [fetchVideos])

  const fetchUserData = async () => {
    try {
      const { users } = useAdminStore.getState()
      const emailMap: Record<string, string> = {}
      const nameMap: Record<string, string> = {}
      users.forEach(user => {
        emailMap[user.id] = user.email
        nameMap[user.id] = user.username
      })
      setUserEmails(emailMap)
      setUserNames(nameMap)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const filteredVideos = videos.filter(video => {
    const searchTerm = videoFilters.search.toLowerCase()
    const matchesSearch = video.youtube_url.toLowerCase().includes(searchTerm) ||
                         (userEmails[video.user_id] || '').toLowerCase().includes(searchTerm) ||
                         (userNames[video.user_id] || '').toLowerCase().includes(searchTerm)
    const matchesStatus = videoFilters.status === 'all' || video.status === videoFilters.status
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="font-medium">Active</Badge>
      case 'completed':
        return <Badge variant="info" className="font-medium">Completed</Badge>
      case 'on_hold':
        return <Badge variant="warning" className="font-medium">On Hold</Badge>
      case 'repromoted':
        return <Badge variant="default" className="font-medium">Repromote</Badge>
      case 'deleted':
        return <Badge variant="danger" className="font-medium">Deleted</Badge>
      default:
        return <Badge variant="default" className="font-medium">{status}</Badge>
    }
  }

  const handleViewVideo = (video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
    // Dispatch popup state change event
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
    // Dispatch popup state change event
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: false } }))
  }

  const handleDeleteVideo = (video) => {
    setVideoToDelete(video)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setVideoToDelete(null)
  }

  const handleConfirmDelete = async (reason: string) => {
    if (!videoToDelete) return
    
    try {
      // Delete video logic will be implemented in the store
      await useAdminStore.getState().deleteVideo(videoToDelete.id, reason)
      setIsDeleteModalOpen(false)
      setVideoToDelete(null)
      // Refresh videos list
      await fetchVideos()
    } catch (error) {
      console.error('Failed to delete video:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 gaming-skeleton rounded-xl" />
        <div className="h-96 gaming-skeleton rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">Video Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage video promotions and track performance</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by video URL, username, or email..."
                value={videoFilters.search}
                onChange={(e) => setVideoFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <select
              value={videoFilters.status}
              onChange={(e) => setVideoFilters({ status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm min-w-[140px] dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="repromoted">Repromoted</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card>
        <CardContent className="p-0 gaming-table">
          {/* Mobile-First Card Layout */}
          <div className="space-y-3 p-4">
            {filteredVideos.map((video) => (
              <div key={video.id} className="gaming-card p-4 hover:scale-[1.01] transition-all duration-300">
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {(userNames[video.user_id] || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userNames[video.user_id] || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userEmails[video.user_id] || 'Unknown Email'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(video.status)}
                    </div>
                  </div>

                  {/* Video URL */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Video URL</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
                      {video.youtube_url}
                    </p>
                  </div>

                  {/* View Criteria */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {video.views_count}/{video.target_views}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVideo(video)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVideo(video)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video View Modal */}
      <VideoEditModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteVideo}
        userEmail={selectedVideo ? userEmails[selectedVideo.user_id] : ''}
        userName={selectedVideo ? userNames[selectedVideo.user_id] : ''}
      />

      {/* Video Delete Modal */}
      <VideoDeleteModal
        video={videoToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        userEmail={videoToDelete ? userEmails[videoToDelete.user_id] : ''}
        userName={videoToDelete ? userNames[videoToDelete.user_id] : ''}
      />
    </div>
  )
}