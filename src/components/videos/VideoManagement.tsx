import React, { useEffect, useState } from 'react'
import { 
  Search, 
  Eye, 
  TrendingUp, 
  Calendar, 
  MoreHorizontal, 
  Copy, 
  Filter,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Users,
  Video as VideoIcon,
  ExternalLink,
  Download,
  BarChart3,
  AlertTriangle,
  Trash2,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Target,
  Timer,
  Award
} from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { VideoEditModal } from './VideoEditModal'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'
import { getSupabaseAdminClient } from '../../lib/supabase'

export function VideoManagement() {
  const { videos, videoFilters, isLoading, fetchVideos, setVideoFilters, copyToClipboard } = useAdminStore()
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'created_at' | 'views_count' | 'coin_cost'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Enhanced filtering with better search
  const filteredVideos = videos.filter(video => {
    if (!video || !video.title || !video.username) return false
    
    const searchTerm = videoFilters.search.toLowerCase()
    const matchesSearch = video.title.toLowerCase().includes(searchTerm) ||
                         video.username.toLowerCase().includes(searchTerm) ||
                         video.id.toLowerCase().includes(searchTerm) ||
                         video.youtube_url.toLowerCase().includes(searchTerm)
    const matchesStatus = videoFilters.status === 'all' || video.status === videoFilters.status
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    const aValue = a[sortBy] || 0
    const bValue = b[sortBy] || 0
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success', label: 'Active', icon: Play, color: 'bg-emerald-500' },
      completed: { variant: 'info', label: 'Completed', icon: CheckCircle, color: 'bg-blue-500' },
      on_hold: { variant: 'warning', label: 'On Hold', icon: Clock, color: 'bg-yellow-500' },
      paused: { variant: 'warning', label: 'Paused', icon: Pause, color: 'bg-orange-500' },
      repromoted: { variant: 'default', label: 'Repromoted', icon: RefreshCw, color: 'bg-purple-500' },
      deleted: { variant: 'danger', label: 'Deleted', icon: Trash2, color: 'bg-red-500' },
      pending: { variant: 'warning', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
      rejected: { variant: 'danger', label: 'Rejected', icon: XCircle, color: 'bg-red-500' }
    }

    const config = statusConfig[status] || { variant: 'default', label: status, icon: VideoIcon, color: 'bg-gray-500' }
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center space-x-1 text-xs">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const statusCounts = {
    all: videos.length,
    active: videos.filter(v => v.status === 'active').length,
    completed: videos.filter(v => v.status === 'completed').length,
    on_hold: videos.filter(v => v.status === 'on_hold').length,
    paused: videos.filter(v => v.status === 'paused').length,
    repromoted: videos.filter(v => v.status === 'repromoted').length,
    deleted: videos.filter(v => v.status === 'deleted').length,
    pending: videos.filter(v => v.status === 'pending').length,
    rejected: videos.filter(v => v.status === 'rejected').length
  }

  const handleViewVideo = (video: any) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: true } }))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
    window.dispatchEvent(new CustomEvent('popupStateChange', { detail: { isOpen: false } }))
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchVideos()
    } catch (error) {
      console.error('Failed to refresh videos:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleVideoAction = async (videoId: string, action: 'approve' | 'reject' | 'pause' | 'resume' | 'delete') => {
    setActionLoading(prev => ({ ...prev, [`${action}-${videoId}`]: true }))
    
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      let updateData: any = {}
      
      switch (action) {
        case 'approve':
          updateData = { status: 'active' }
          break
        case 'reject':
          updateData = { status: 'rejected' }
          break
        case 'pause':
          updateData = { status: 'paused' }
          break
        case 'resume':
          updateData = { status: 'active' }
          break
        case 'delete':
          updateData = { status: 'deleted' }
          break
      }

      const { error } = await supabase
        .from('videos')
        .update(updateData)
        .eq('id', videoId)

      if (error) throw error

      await fetchVideos()
    } catch (error) {
      console.error(`Error ${action}ing video:`, error)
    } finally {
      setActionLoading(prev => ({ ...prev, [`${action}-${videoId}`]: false }))
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-3 md:space-y-4 animate-pulse">
        {/* Mobile-optimized loading skeleton */}
        <div className="flex flex-col space-y-2">
          <div className="h-6 md:h-8 bg-gray-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-64" />
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 md:h-20 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
        
        <div className="h-64 md:h-96 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4 animate-fade-in">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold gaming-gradient-text gaming-text-shadow">
            Video Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Manage video promotions and track performance
          </p>
        </div>
        
        <div className="flex items-center justify-between md:justify-end space-x-2">
          {/* Mobile View Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2 py-1"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2 py-1"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="md:hidden"
          >
            <Filter className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Status Overview - Mobile Responsive Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2 md:gap-3 animate-stagger-children">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status} 
            className={`gaming-card-enhanced cursor-pointer transition-all duration-300 hover:scale-105 ${
              videoFilters.status === status ? 'ring-2 ring-violet-500 bg-violet-50/50 dark:bg-violet-900/30' : ''
            }`}
            onClick={() => setVideoFilters({ status: status === videoFilters.status ? 'all' : status })}
          >
            <CardContent className="p-2 md:p-3 text-center">
              <div className="text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
                {count}
              </div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 capitalize font-medium">
                {status === 'all' ? 'Total' : status.replace('_', ' ')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters - Mobile Responsive */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-3 md:p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title, creator, video ID, or YouTube URL..."
                value={videoFilters.search}
                onChange={(e) => setVideoFilters({ search: e.target.value })}
                className="pl-10 text-sm md:text-base"
              />
            </div>
            
            {/* Filters Row - Collapsible on Mobile */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <select
                  value={videoFilters.status}
                  onChange={(e) => setVideoFilters({ status: e.target.value })}
                  className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input flex-1 sm:flex-none sm:min-w-[140px]"
                >
                  <option value="all">All Status ({statusCounts.all})</option>
                  <option value="active">Active ({statusCounts.active})</option>
                  <option value="completed">Completed ({statusCounts.completed})</option>
                  <option value="pending">Pending ({statusCounts.pending})</option>
                  <option value="on_hold">On Hold ({statusCounts.on_hold})</option>
                  <option value="paused">Paused ({statusCounts.paused})</option>
                  <option value="repromoted">Repromoted ({statusCounts.repromoted})</option>
                  <option value="deleted">Deleted ({statusCounts.deleted})</option>
                  <option value="rejected">Rejected ({statusCounts.rejected})</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input flex-1 sm:flex-none sm:min-w-[120px]"
                >
                  <option value="created_at">Date Created</option>
                  <option value="views_count">View Count</option>
                  <option value="coin_cost">Coins Spent</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center space-x-1 flex-1 sm:flex-none"
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  <span className="sm:hidden">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Display */}
      {viewMode === 'grid' ? (
        /* Enhanced Grid View - Mobile First */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="gaming-card-enhanced hover:scale-[1.02] transition-all duration-300 group overflow-hidden">
              <CardContent className="p-0">
                {/* Video Thumbnail with Overlay */}
                <div className="relative aspect-video bg-gradient-to-br from-violet-500/20 to-purple-600/20 overflow-hidden">
                  <img
                    src={video.thumbnail_url || `https://images.pexels.com/photos/2000/pexels-photo-2000.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop`}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgODBMMjQwIDEyNUwzMjAgODBWMTQ1SDE2MFY4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                    }}
                  />
                  
                  {/* Status Badge Overlay */}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(video.status)}
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-black/50 text-white text-xs">
                      {Math.floor((video.duration_seconds || 0) / 60)}:{String((video.duration_seconds || 0) % 60).padStart(2, '0')}
                    </Badge>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${getProgressPercentage(video.views_count, video.target_views)}%` }}
                    />
                  </div>
                  
                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewVideo(video)}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(video.youtube_url, '_blank')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-3 md:p-4 space-y-3">
                  {/* Title and Creator */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base line-clamp-2 mb-2 leading-tight">
                      {video.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {video.username.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {video.username}
                      </p>
                    </div>
                  </div>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <Eye className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.views_count)}/{formatNumber(video.target_views)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-orange-500 dark:text-orange-400">
                      <Coins className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatNumber(video.coin_cost)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-500 dark:text-emerald-400">
                      <Target className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{video.completion_rate || 0}%</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-500 dark:text-blue-400">
                      <Timer className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{Math.floor((video.total_watch_time || 0) / 60)}m</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar with Label */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Progress</span>
                      <span className="font-medium">{getProgressPercentage(video.views_count, video.target_views).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${getProgressPercentage(video.views_count, video.target_views)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer with Date and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(video.created_at), 'MMM dd')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {video.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleVideoAction(video.id, 'approve')}
                            disabled={actionLoading[`approve-${video.id}`]}
                            className="px-2 py-1 text-xs"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleVideoAction(video.id, 'reject')}
                            disabled={actionLoading[`reject-${video.id}`]}
                            className="px-2 py-1 text-xs"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {video.status === 'active' && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleVideoAction(video.id, 'pause')}
                          disabled={actionLoading[`pause-${video.id}`]}
                          className="px-2 py-1 text-xs"
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                      )}
                      {video.status === 'paused' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleVideoAction(video.id, 'resume')}
                          disabled={actionLoading[`resume-${video.id}`]}
                          className="px-2 py-1 text-xs"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVideo(video)}
                        className="px-2 py-1 text-xs"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Enhanced List View - Mobile Optimized */
        <Card className="gaming-card-enhanced">
          <CardContent className="p-0">
            {/* Mobile Card List */}
            <div className="block lg:hidden divide-y divide-gray-200 dark:divide-slate-700">
              {filteredVideos.map((video) => (
                <div key={video.id} className="p-3 md:p-4 hover:bg-violet-500/5 transition-colors">
                  <div className="flex items-start space-x-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-12 md:w-20 md:h-15 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={video.thumbnail_url || `https://images.pexels.com/photos/2000/pexels-photo-2000.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkwzMiAyNEw0NCAxNlYzMkgyMFYxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm md:text-base line-clamp-2 mb-1 leading-tight">
                            {video.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {video.username.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {video.username}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewVideo(video)}
                          className="ml-2 flex-shrink-0 p-1"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(video.status)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {formatNumber(video.views_count)}/{formatNumber(video.target_views)}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercentage(video.views_count, video.target_views)}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Metrics Row */}
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Coins className="w-3 h-3" />
                          <span>{formatNumber(video.coin_cost)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{video.completion_rate || 0}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(video.created_at), 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full gaming-table">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Video</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Creator</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Progress</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Metrics</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={video.thumbnail_url || `https://images.pexels.com/photos/2000/pexels-photo-2000.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA0OCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMEwyNCAyMEwzMiAxMFYyMkgyMFYxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1 text-sm">
                              {video.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <code className="bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded text-xs font-mono text-violet-600 dark:text-violet-400">
                                {video.id.slice(0, 8)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(video.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                            {video.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{video.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(video.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="font-mono font-medium text-gray-900 dark:text-white">
                              {formatNumber(video.views_count)}/{formatNumber(video.target_views)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(video.views_count, video.target_views)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-1 text-orange-500 dark:text-orange-400">
                            <Coins className="w-3 h-3" />
                            <span>{formatNumber(video.coin_cost)} coins</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-500 dark:text-emerald-400">
                            <Target className="w-3 h-3" />
                            <span>{video.completion_rate || 0}% completion</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(video.created_at), 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {video.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleVideoAction(video.id, 'approve')}
                                disabled={actionLoading[`approve-${video.id}`]}
                                className="px-2 py-1"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                <span className="hidden xl:inline">Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleVideoAction(video.id, 'reject')}
                                disabled={actionLoading[`reject-${video.id}`]}
                                className="px-2 py-1"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                <span className="hidden xl:inline">Reject</span>
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewVideo(video)}
                            className="px-2 py-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            <span className="hidden xl:inline">View</span>
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
      )}

      {/* Empty State */}
      {filteredVideos.length === 0 && !isLoading && (
        <Card className="gaming-card-enhanced">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <VideoIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {videoFilters.search || videoFilters.status !== 'all' ? 'No videos found' : 'No videos yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {videoFilters.search || videoFilters.status !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Videos will appear here when users start promoting content'
              }
            </p>
            {(videoFilters.search || videoFilters.status !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setVideoFilters({ search: '', status: 'all' })
                  setShowFilters(false)
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Eye className="w-4 h-4 md:w-5 md:h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-lg md:text-xl font-bold text-violet-600 dark:text-violet-400">
              {formatNumber(filteredVideos.reduce((sum, v) => sum + (v.views_count || 0), 0))}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Views</div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(filteredVideos.reduce((sum, v) => sum + (v.coin_cost || 0), 0))}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Coins Spent</div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {filteredVideos.length > 0 
                ? Math.round(filteredVideos.reduce((sum, v) => sum + (v.completion_rate || 0), 0) / filteredVideos.length)
                : 0}%
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Avg Completion</div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card-enhanced">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Timer className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
              {Math.floor(filteredVideos.reduce((sum, v) => sum + (v.total_watch_time || 0), 0) / 60)}m
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Watch Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Details Modal */}
      <VideoEditModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}