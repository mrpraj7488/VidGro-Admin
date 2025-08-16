import React, { useEffect, useState } from 'react'
import { Search, Eye, TrendingUp, Calendar, MoreHorizontal, Copy, Trash2, ExternalLink, User, Link, CheckCircle } from 'lucide-react'
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
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      await fetchVideos()
      await fetchUserData()
    }
    loadData()
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
    const userEmail = userEmails[video.user_id] || ''
    const userName = userNames[video.user_id] || ''
    const videoUrl = video.youtube_url || ''
    const videoId = video.video_id || ''
    
    const matchesSearch = video.title.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         userEmail.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         userName.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         videoUrl.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         videoId.toLowerCase().includes(videoFilters.search.toLowerCase())
    const matchesStatus = videoFilters.status === 'all' || video.status === videoFilters.status
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="font-medium text-xs">Active</Badge>
      case 'completed':
        return <Badge variant="info" className="font-medium text-xs">Completed</Badge>
      case 'on_hold':
        return <Badge variant="warning" className="font-medium text-xs">On Hold</Badge>
      case 'repromoted':
        return <Badge variant="default" className="font-medium text-xs">Repromoted</Badge>
      case 'deleted':
        return <Badge variant="danger" className="font-medium text-xs">Deleted</Badge>
      default:
        return <Badge variant="default" className="font-medium text-xs">{status}</Badge>
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
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
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
      await useAdminStore.getState().deleteVideo(videoToDelete.id, reason)
      setIsDeleteModalOpen(false)
      setVideoToDelete(null)
      await fetchVideos()
    } catch (error) {
      console.error('Failed to delete video:', error)
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await copyToClipboard(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : url
  }

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="h-12 md:h-16 gaming-skeleton rounded-xl" />
        <div className="h-64 md:h-96 gaming-skeleton rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">Video Management</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Manage video promotions and track performance</p>
        </div>
      </div>

      {/* Status Overview - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status} 
            className="text-center p-3 md:p-4 cursor-pointer gaming-interactive hover:scale-[1.02] transition-all duration-300"
            onClick={() => setVideoFilters({ status: status === videoFilters.status ? 'all' : status })}
          >
            <div className="text-lg md:text-2xl font-bold text-violet-600 dark:text-violet-400 gaming-text-shadow">
              {count}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 capitalize font-medium">
              {status.replace('_', ' ')}
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters - Enhanced */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by video URL, user email, or username..."
                value={videoFilters.search}
                onChange={(e) => setVideoFilters({ search: e.target.value })}
                className="pl-10 text-sm"
              />
            </div>
            
            <select
              value={videoFilters.status}
              onChange={(e) => setVideoFilters({ status: e.target.value })}
              className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input min-w-[120px]"
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

      {/* Videos Table - Improved Structure */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-0">
          {/* Mobile Card View - Enhanced */}
          <div className="block lg:hidden">
            <div className="divide-y divide-violet-500/20">
              {filteredVideos.map((video) => (
                <div key={video.id} className="p-4 hover:bg-violet-500/5 transition-colors">
                  {/* User Info Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm gaming-glow flex-shrink-0">
                        {(userEmails[video.user_id] || userNames[video.user_id] || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {userNames[video.user_id] || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {userEmails[video.user_id] || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusBadge(video.status)}
                    </div>
                  </div>
                  
                  {/* Video URL - Copyable */}
                  <div className="mb-3 p-3 bg-violet-500/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Link className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        <span className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                          {extractVideoId(video.youtube_url)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyUrl(video.youtube_url)}
                        className="flex items-center space-x-1 text-xs flex-shrink-0"
                      >
                        {copiedUrl === video.youtube_url ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Video Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-emerald-500/10 rounded-lg p-2">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {formatNumber(video.views_count)}/{formatNumber(video.target_views)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Views</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-green-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (video.views_count / video.target_views) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-2">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {video.completion_rate || 0}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {format(new Date(video.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVideo(video)}
                        className="flex items-center space-x-1 text-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVideo(video)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View - New Structure */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr className="border-b border-violet-500/20 bg-violet-500/5">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">Video URL</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">Video Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">View Criteria</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="border-b border-violet-500/10 hover:bg-violet-500/5 transition-colors group">
                    {/* User Column - Email + Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm gaming-glow flex-shrink-0">
                          {(userEmails[video.user_id] || userNames[video.user_id] || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {userEmails[video.user_id] || 'Unknown Email'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {userNames[video.user_id] || 'Unknown User'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Video URL Column - Copyable */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 max-w-xs">
                        <div className="flex items-center space-x-2 bg-violet-500/10 rounded-lg px-3 py-2 flex-1 min-w-0">
                          <Link className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                            {extractVideoId(video.youtube_url)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyUrl(video.youtube_url)}
                          className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          {copiedUrl === video.youtube_url ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>

                    {/* Video Status Column */}
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        {getStatusBadge(video.status)}
                        {video.completion_rate !== undefined && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {video.completion_rate}% completion
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(video.created_at), 'MMM dd')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* View Criteria Column - Enhanced */}
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                            {formatNumber(video.views_count)}/{formatNumber(video.target_views)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (video.views_count / video.target_views) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round((video.views_count / video.target_views) * 100)}% complete
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewVideo(video)}
                          className="flex items-center space-x-1 text-xs opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(video)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs opacity-70 group-hover:opacity-100 transition-opacity"
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

          {/* Empty State */}
          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-violet-500 dark:text-violet-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Videos Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {videoFilters.search || videoFilters.status !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Videos will appear here when users submit them for promotion'
                }
              </p>
            </div>
          )}
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