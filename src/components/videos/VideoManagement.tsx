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

  useEffect(() => {
    fetchVideos()
    fetchUserEmails()
  }, [fetchVideos])

  const fetchUserEmails = async () => {
    try {
      const { users } = useAdminStore.getState()
      const emailMap: Record<string, string> = {}
      users.forEach(user => {
        emailMap[user.id] = user.email
      })
      setUserEmails(emailMap)
    } catch (error) {
      console.error('Failed to fetch user emails:', error)
    }
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         (userEmails[video.user_id] || '').toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         video.video_id.toLowerCase().includes(videoFilters.search.toLowerCase())
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

  const statusCounts = {
    active: videos.filter(v => v.status === 'active').length,
    completed: videos.filter(v => v.status === 'completed').length,
    on_hold: videos.filter(v => v.status === 'on_hold').length,
    repromoted: videos.filter(v => v.status === 'repromoted').length,
    deleted: videos.filter(v => v.status === 'deleted').length
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

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="text-center p-4 cursor-pointer gaming-interactive"
                onClick={() => setVideoFilters({ status: status === videoFilters.status ? 'all' : status })}>
            <div className="gaming-metric-value !text-2xl">{count}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{status.replace('_', ' ')}</div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title, user email, or video ID..."
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
          <div className="overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr>
                  <th className="text-left">Video Title</th>
                  <th className="text-left">User Email</th>
                  <th className="text-left">Video Status</th>
                  <th className="text-left">View Criteria</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="group">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-2">{video.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {video.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                          {(userEmails[video.user_id] || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userEmails[video.user_id] || 'Unknown User'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(video.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm font-medium">{video.views_count}/{video.target_views}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      />

      {/* Video Delete Modal */}
      <VideoDeleteModal
        video={videoToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        userEmail={videoToDelete ? userEmails[videoToDelete.user_id] : ''}
      />
    </div>
  )
}