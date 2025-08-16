import React, { useEffect, useState } from 'react'
import { Search, Eye, TrendingUp, Calendar, MoreHorizontal, Copy, Filter, RefreshCw, Video as VideoIcon, Users, Coins, Play } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { VideoEditModal } from './VideoEditModal'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'
import { getSupabaseAdminClient } from '../../lib/supabase'

interface VideoWithUser {
  id: string
  user_id: string
  username: string
  user_email: string
  youtube_url: string
  title: string
  views_count: number
  target_views: number
  duration_seconds: number
  coin_reward: number
  coin_cost: number
  status: 'pending' | 'active' | 'paused' | 'completed' | 'on_hold' | 'repromoted' | 'deleted' | 'rejected'
  hold_until?: string
  repromoted_at?: string
  total_watch_time: number
  completion_rate: number
  created_at: string
  updated_at: string
  completed: boolean
  coins_earned_total: number
}

export function VideoManagement() {
  const { videoFilters, setVideoFilters, copyToClipboard } = useAdminStore()
  const [videos, setVideos] = useState<VideoWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoWithUser | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'created_at' | 'views_count' | 'coin_cost' | 'completion_rate'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchVideosWithUsers()
  }, [])

  const fetchVideosWithUsers = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase Admin not initialized')
      }

      // Fetch videos with user information using a join
      const { data: videosData, error } = await supabase
        .from('videos')
        .select(`
          id,
          user_id,
          youtube_url,
          title,
          views_count,
          target_views,
          duration_seconds,
          coin_reward,
          coin_cost,
          status,
          hold_until,
          repromoted_at,
          total_watch_time,
          completion_rate,
          created_at,
          updated_at,
          completed,
          coins_earned_total,
          profiles!inner(username, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to include user information
      const transformedVideos: VideoWithUser[] = (videosData || []).map((video: any) => ({
        id: video.id,
        user_id: video.user_id,
        username: video.profiles?.username || 'Unknown User',
        user_email: video.profiles?.email || 'No email',
        youtube_url: video.youtube_url,
        title: video.title,
        views_count: video.views_count || 0,
        target_views: video.target_views || 0,
        duration_seconds: video.duration_seconds || 0,
        coin_reward: video.coin_reward || 0,
        coin_cost: video.coin_cost || 0,
        status: video.status,
        hold_until: video.hold_until,
        repromoted_at: video.repromoted_at,
        total_watch_time: video.total_watch_time || 0,
        completion_rate: video.completion_rate || 0,
        created_at: video.created_at,
        updated_at: video.updated_at,
        completed: video.completed || false,
        coins_earned_total: video.coins_earned_total || 0
      }))

      setVideos(transformedVideos)
    } catch (error) {
      console.error('Error fetching videos with users:', error)
      setVideos([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                           video.username.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                           video.user_email.toLowerCase().includes(videoFilters.search.toLowerCase()) ||
                           video.youtube_url.toLowerCase().includes(videoFilters.search.toLowerCase())
      const matchesStatus = videoFilters.status === 'all' || video.status === videoFilters.status
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active', icon: '🟢' },
      completed: { variant: 'info' as const, label: 'Completed', icon: '✅' },
      on_hold: { variant: 'warning' as const, label: 'On Hold', icon: '⏸️' },
      paused: { variant: 'warning' as const, label: 'Paused', icon: '⏸️' },
      pending: { variant: 'default' as const, label: 'Pending', icon: '⏳' },
      repromoted: { variant: 'info' as const, label: 'Repromoted', icon: '🔄' },
      deleted: { variant: 'danger' as const, label: 'Deleted', icon: '🗑️' },
      rejected: { variant: 'danger' as const, label: 'Rejected', icon: '❌' }
    }

    const config = statusConfig[status] || { variant: 'default' as const, label: status, icon: '❓' }
    
    return (
      <Badge variant={config.variant} className="text-xs font-medium flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </Badge>
    )
  }

  const statusCounts = {
    all: videos.length,
    active: videos.filter(v => v.status === 'active').length,
    completed: videos.filter(v => v.status === 'completed').length,
    pending: videos.filter(v => v.status === 'pending').length,
    on_hold: videos.filter(v => v.status === 'on_hold').length,
    paused: videos.filter(v => v.status === 'paused').length,
    repromoted: videos.filter(v => v.status === 'repromoted').length,
    deleted: videos.filter(v => v.status === 'deleted').length,
    rejected: videos.filter(v => v.status === 'rejected').length
  }

  const handleViewVideo = (video: VideoWithUser) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: false } }))
  }

  const handleVideoUpdate = () => {
    // Refresh videos list after any updates
    fetchVideosWithUsers()
  }

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 gaming-skeleton rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 gaming-skeleton rounded-xl" />
          ))}
        </div>
        <div className="h-96 gaming-skeleton rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Video Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {filteredAndSortedVideos.length} of {videos.length} videos
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 sm:hidden"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVideosWithUsers}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Status Overview - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status} 
            className={`cursor-pointer gaming-interactive transition-all duration-300 hover:scale-105 ${
              videoFilters.status === status ? 'ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-900/30' : ''
            }`}
            onClick={() => setVideoFilters({ status: status === videoFilters.status ? 'all' : status })}
          >
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {status.replace('_', ' ')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters - Collapsible on Mobile */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title, creator, email, or YouTube URL..."
                value={videoFilters.search}
                onChange={(e) => setVideoFilters({ search: e.target.value })}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Filters Row - Hidden on mobile unless toggled */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
              <select
                value={videoFilters.status}
                onChange={(e) => setVideoFilters({ status: e.target.value })}
                className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="on_hold">On Hold</option>
                <option value="paused">Paused</option>
                <option value="repromoted">Repromoted</option>
                <option value="deleted">Deleted</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input"
              >
                <option value="created_at">Sort by Date</option>
                <option value="views_count">Sort by Views</option>
                <option value="coin_cost">Sort by Coins</option>
                <option value="completion_rate">Sort by Completion</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos List - Mobile-First Design */}
      <div className="space-y-3">
        {filteredAndSortedVideos.length === 0 ? (
          <Card className="gaming-card-enhanced">
            <CardContent className="p-8 text-center">
              <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Videos Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {videoFilters.search || videoFilters.status !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Videos will appear here when users upload them'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedVideos.map((video) => (
            <Card key={video.id} className="gaming-card-enhanced hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-4">
                {/* Mobile Layout */}
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                          {video.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{video.username}</span>
                          <span className="text-xs">{video.user_email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {getStatusBadge(video.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVideo(video)}
                        className="p-1"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatNumber(video.views_count)} / {formatNumber(video.target_views)} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(video.views_count, video.target_views)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getProgressPercentage(video.views_count, video.target_views).toFixed(1)}% complete
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {formatNumber(video.coin_cost)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Coins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {video.completion_rate}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Completion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {Math.floor(video.total_watch_time / 60)}m
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Watch Time</div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(video.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(video.youtube_url)}
                        className="p-1 text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(video.youtube_url, '_blank')}
                        className="p-1 text-xs"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Video Detail Modal */}
      <VideoEditModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onVideoUpdate={handleVideoUpdate}
      />
    </div>
  )
}