import React, { useEffect, useState } from 'react'
import { Search, Eye, TrendingUp, Calendar, MoreHorizontal, Copy } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { VideoEditModal } from './VideoEditModal'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

export function VideoManagement() {
  const { videos, videoFilters, isLoading, fetchVideos, setVideoFilters, copyToClipboard } = useAdminStore()
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Filter out any invalid videos and apply search filters
  const filteredVideos = videos.filter(video => {
    if (!video || !video.title || !video.username) return false
    
    const searchTerm = videoFilters.search.toLowerCase()
    const matchesSearch = video.title.toLowerCase().includes(searchTerm) ||
                         video.username.toLowerCase().includes(searchTerm)
    const matchesStatus = videoFilters.status === 'all' || video.status === videoFilters.status
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="font-medium">Active</Badge>
      case 'pending':
        return <Badge variant="warning" className="font-medium">Pending</Badge>
      case 'completed':
        return <Badge variant="info" className="font-medium">Completed</Badge>
      case 'on_hold':
        return <Badge variant="warning" className="font-medium">On Hold</Badge>
      case 'deleted':
        return <Badge variant="danger" className="font-medium">Deleted</Badge>
      case 'rejected':
        return <Badge variant="danger" className="font-medium">Rejected</Badge>
      default:
        return <Badge variant="default" className="font-medium">{status}</Badge>
    }
  }

  const handleVideoAction = async (videoId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      switch (action) {
        case 'approve':
          // await approveVideo(videoId)
          break
        case 'reject':
          // await rejectVideo(videoId, 'Rejected by admin')
          break
        case 'delete':
          // await deleteVideo(videoId)
          break
      }
      await fetchVideos()
    } catch (error) {
      console.error(`Error ${action}ing video:`, error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Management</h2>
          <p className="text-gray-600">Manage and moderate video content</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {videos.length} | Active: {videos.filter(v => v && v.status === 'active').length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search videos by title, username, or video ID..."
              value={videoFilters.search}
              onChange={(e) => setVideoFilters({ search: e.target.value })}
            />
          </div>
          <select
            value={videoFilters.status}
            onChange={(e) => setVideoFilters({ status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="deleted">Deleted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coins
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src="/placeholder-thumbnail.jpg"
                          alt={video.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{video.title}</div>
                        <div className="text-sm text-gray-500">ID: {video.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{video.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(video.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {video.views_count || 0} / {video.target_views || 1000}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {video.coin_reward || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {video.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVideoAction(video.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVideoAction(video.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleVideoAction(video.id, 'delete')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No videos found</div>
          </div>
        )}
      </div>

      {/* Video Details Modal */}
      {selectedVideo && (
        <VideoEditModal
          video={selectedVideo}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedVideo(null)
          }}
        />
      )}
    </div>
  )
}
