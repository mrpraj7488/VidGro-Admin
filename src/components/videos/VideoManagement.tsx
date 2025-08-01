import React, { useEffect, useState } from 'react'
import { Search, Play, Pause, Eye, TrendingUp, Calendar, MoreHorizontal, Copy, Edit, RefreshCw, Trash2, Clock } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { VideoEditModal } from './VideoEditModal'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

export function VideoManagement() {
  const { videos, videoFilters, isLoading, fetchVideos, updateVideoStatus, setVideoFilters, copyToClipboard } = useAdminStore()
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         video.username.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
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
      case 'hold':
        return <Badge variant="warning" className="font-medium">On Hold</Badge>
      case 'repromote':
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
    hold: videos.filter(v => v.status === 'hold').length,
    repromote: videos.filter(v => v.status === 'repromote').length,
    deleted: videos.filter(v => v.status === 'deleted').length
  }

  const handleEditVideo = (video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
        <div className="h-96 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600">Manage video promotions and track performance</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setVideoFilters({ status: status === videoFilters.status ? 'all' : status })}>
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-500 capitalize">{status}</div>
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
                placeholder="Search by Video ID, title, or creator..."
                value={videoFilters.search}
                onChange={(e) => setVideoFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <select
              value={videoFilters.status}
              onChange={(e) => setVideoFilters({ status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="hold">On Hold</option>
              <option value="repromote">Repromote</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Video Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">View Criteria</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Video ID</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVideos.map((video) => (
                  <tr key={video.video_id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                          {video.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{video.username}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{video.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(video.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm font-medium">{video.view_criteria}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{video.video_id}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(video.video_id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVideo(video)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Video Edit Modal */}
      <VideoEditModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedVideo(null)
        }}
      />
    </div>
  )
}