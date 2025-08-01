import React, { useEffect } from 'react'
import { Search, Play, Pause, Eye, TrendingUp, Calendar, MoreHorizontal } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

export function VideoManagement() {
  const { videos, videoFilters, isLoading, fetchVideos, updateVideoStatus, setVideoFilters } = useAdminStore()

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                         video.username.toLowerCase().includes(videoFilters.search.toLowerCase())
    const matchesStatus = videoFilters.status === 'all' || video.status === videoFilters.status
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'paused':
        return <Badge variant="warning">Paused</Badge>
      case 'completed':
        return <Badge variant="info">Completed</Badge>
      case 'flagged':
        return <Badge variant="danger">Flagged</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Video Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search videos by title or creator..."
                value={videoFilters.search}
                onChange={(e) => setVideoFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <select
              value={videoFilters.status}
              onChange={(e) => setVideoFilters({ status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.video_id} className="overflow-hidden group hover:shadow-lg transition-all duration-200">
            <div className="relative">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
              <div className="absolute top-3 left-3">
                {getStatusBadge(video.status)}
              </div>
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/20 hover:bg-black/40 text-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(video.views_count)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{video.completion_rate}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-3">by {video.username}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(video.created_at), 'MMM dd')}</span>
                </div>
                <div className="flex items-center space-x-1 text-orange-600">
                  <span>{formatNumber(video.coins_spent)} coins</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {video.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => updateVideoStatus(video.video_id, 'paused')}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => updateVideoStatus(video.video_id, 'active')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
                
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredVideos.length}</div>
            <div className="text-sm text-gray-500">Total Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {filteredVideos.filter(v => v.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredVideos.filter(v => v.status === 'paused').length}
            </div>
            <div className="text-sm text-gray-500">Paused</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredVideos.filter(v => v.status === 'flagged').length}
            </div>
            <div className="text-sm text-gray-500">Flagged</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}