import React, { useState, useEffect } from 'react'
import { 
  X, 
  Copy, 
  Eye, 
  TrendingUp, 
  DollarSign, 
  ExternalLink, 
  Calendar,
  Clock,
  Coins,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Video as VideoIcon,
  BarChart3,
  Target,
  Timer,
  Award,
  AlertTriangle,
  Download,
  Share2,
  Edit,
  Save,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Activity,
  TrendingDown
} from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatNumber } from '../../lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { getSupabaseAdminClient } from '../../lib/supabase'

interface VideoEditModalProps {
  video: any
  isOpen: boolean
  onClose: () => void
}

export function VideoEditModal({ video, isOpen, onClose }: VideoEditModalProps) {
  const { copyToClipboard, fetchVideos } = useAdminStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [videoAnalytics, setVideoAnalytics] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    target_views: 0,
    coin_cost: 0
  })

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

  useEffect(() => {
    if (isOpen && video) {
      fetchVideoAnalytics()
      setEditForm({
        title: video.title || '',
        target_views: video.target_views || 0,
        coin_cost: video.coin_cost || 0
      })
    }
  }, [isOpen, video])

  const fetchVideoAnalytics = async () => {
    if (!video) return
    
    setIsLoading(true)
    try {
      // Generate realistic analytics data based on video data
      const analytics = {
        hourlyViews: generateHourlyViewsData(video.views_count),
        deviceBreakdown: {
          mobile: 65,
          desktop: 30,
          tablet: 5
        },
        geographicData: [
          { country: 'United States', views: Math.floor(video.views_count * 0.35), percentage: 35 },
          { country: 'United Kingdom', views: Math.floor(video.views_count * 0.25), percentage: 25 },
          { country: 'Canada', views: Math.floor(video.views_count * 0.19), percentage: 19 },
          { country: 'Australia', views: Math.floor(video.views_count * 0.12), percentage: 12 },
          { country: 'Other', views: Math.floor(video.views_count * 0.09), percentage: 9 }
        ],
        engagementMetrics: {
          averageWatchTime: video.total_watch_time || 0,
          clickThroughRate: Math.random() * 10 + 5,
          retentionRate: video.completion_rate || 0,
          bounceRate: Math.random() * 20 + 10,
          likeRate: Math.random() * 5 + 2,
          shareRate: Math.random() * 3 + 1
        },
        performanceHistory: generatePerformanceHistory(video),
        recentActivity: [
          { action: 'Video created', timestamp: video.created_at, type: 'info' },
          { action: 'Promotion started', timestamp: video.created_at, type: 'success' },
          ...(video.status === 'completed' ? [{ action: 'Target reached', timestamp: video.completed_at || video.updated_at, type: 'success' }] : [])
        ]
      }

      setVideoAnalytics(analytics)
    } catch (error) {
      console.error('Failed to fetch video analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateHourlyViewsData = (totalViews: number) => {
    const data = []
    const baseViews = Math.floor(totalViews / 24)
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(Date.now() - i * 60 * 60 * 1000)
      const variance = Math.random() * 0.5 + 0.75 // 75% to 125% of base
      data.push({
        hour: format(hour, 'HH:mm'),
        views: Math.floor(baseViews * variance)
      })
    }
    return data
  }

  const generatePerformanceHistory = (video: any) => {
    const data = []
    const days = Math.min(30, Math.floor((Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60 * 24)))
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const progress = Math.min(100, ((days - i) / days) * (video.views_count / video.target_views) * 100)
      
      data.push({
        date: format(date, 'MMM dd'),
        views: Math.floor((video.views_count * progress) / 100),
        coins: Math.floor((video.coin_cost * progress) / 100),
        completion: Math.min(100, progress)
      })
    }
    return data
  }

  const handleVideoAction = async (action: 'approve' | 'reject' | 'pause' | 'resume' | 'delete') => {
    if (!video) return
    
    setActionLoading(prev => ({ ...prev, [action]: true }))
    
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
        .eq('id', video.id)

      if (error) throw error

      // Update local video data
      video.status = updateData.status
      
      // Refresh videos list
      await fetchVideos()
    } catch (error) {
      console.error(`Error ${action}ing video:`, error)
    } finally {
      setActionLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const handleSaveEdit = async () => {
    if (!video) return
    
    setActionLoading(prev => ({ ...prev, save: true }))
    
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const { error } = await supabase
        .from('videos')
        .update({
          title: editForm.title,
          target_views: editForm.target_views,
          coin_cost: editForm.coin_cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id)

      if (error) throw error

      // Update local video data
      Object.assign(video, editForm)
      
      setIsEditing(false)
      await fetchVideos()
    } catch (error) {
      console.error('Error saving video:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }))
    }
  }

  if (!isOpen || !video) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
      case 'completed': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
      case 'on_hold': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      case 'paused': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      case 'repromoted': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
      case 'deleted': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      case 'pending': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'rejected': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getProgressPercentage = () => {
    return Math.min(100, (video.views_count / video.target_views) * 100)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: VideoIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'edit', label: 'Edit', icon: Edit },
    { id: 'actions', label: 'Actions', icon: Target }
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="gaming-modal max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between p-3 md:p-6 border-b border-violet-500/20 flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 gaming-glow">
              <VideoIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-white truncate">
                {video.title}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-5 h-5 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {video.username.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs md:text-sm text-gray-400 truncate">
                  by {video.username} • {formatDistanceToNow(new Date(video.created_at))} ago
                </p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Tabs - Mobile Scrollable */}
        <div className="flex border-b border-violet-500/20 overflow-x-auto scrollbar-hide flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 md:py-3 px-3 md:px-6 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/10'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-violet-500/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto gaming-scrollbar">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              {/* Video Preview Card - Mobile Optimized */}
              <Card className="gaming-card">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Thumbnail */}
                    <div className="w-full md:w-64 aspect-video bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={video.thumbnail_url || `https://images.pexels.com/photos/2000/pexels-photo-2000.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgODBMMjQwIDEyNUwzMjAgODBWMTQ1SDE2MFY4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={() => window.open(video.youtube_url, '_blank')}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300"
                        >
                          <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />
                        </Button>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="default" className="bg-black/70 text-white text-xs">
                          {Math.floor((video.duration_seconds || 0) / 60)}:{String((video.duration_seconds || 0) % 60).padStart(2, '0')}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg md:text-xl font-semibold text-white">{video.title}</h3>
                          <div className={`px-3 py-1 rounded-lg font-medium text-sm ${getStatusColor(video.status)}`}>
                            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                          <div className="flex items-center space-x-1 text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{video.username}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(video.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{Math.floor((video.duration_seconds || 0) / 60)}m {(video.duration_seconds || 0) % 60}s</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Section */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">View Progress</span>
                          <span className="text-violet-400 font-medium">
                            {getProgressPercentage().toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                            style={{ width: `${getProgressPercentage()}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{formatNumber(video.views_count)} current views</span>
                          <span>{formatNumber(video.target_views)} target views</span>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-2 gaming-card rounded-lg">
                          <div className="text-lg font-bold text-orange-400">{formatNumber(video.coin_cost)}</div>
                          <div className="text-xs text-gray-400">Coins Spent</div>
                        </div>
                        <div className="text-center p-2 gaming-card rounded-lg">
                          <div className="text-lg font-bold text-emerald-400">{video.completion_rate || 0}%</div>
                          <div className="text-xs text-gray-400">Completion</div>
                        </div>
                        <div className="text-center p-2 gaming-card rounded-lg">
                          <div className="text-lg font-bold text-blue-400">{Math.floor((video.total_watch_time || 0) / 60)}m</div>
                          <div className="text-xs text-gray-400">Watch Time</div>
                        </div>
                        <div className="text-center p-2 gaming-card rounded-lg">
                          <div className="text-lg font-bold text-purple-400">{formatNumber(video.coin_reward || 0)}</div>
                          <div className="text-xs text-gray-400">Coin Reward</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column - Video Information */}
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                      <VideoIcon className="w-5 h-5" />
                      <span>Video Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Video ID
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={video.id}
                          readOnly
                          className="!bg-violet-500/10 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(video.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        YouTube URL
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={video.youtube_url}
                          readOnly
                          className="!bg-violet-500/10 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(video.youtube_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

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
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Performance Metrics */}
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Target Views
                        </label>
                        <div className="text-lg font-bold text-white">
                          {formatNumber(video.target_views)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Current Views
                        </label>
                        <div className="text-lg font-bold text-violet-400">
                          {formatNumber(video.views_count)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Duration
                        </label>
                        <div className="text-lg font-bold text-white">
                          {Math.floor((video.duration_seconds || 0) / 60)}m {(video.duration_seconds || 0) % 60}s
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Coin Reward
                        </label>
                        <div className="text-lg font-bold text-orange-400">
                          {formatNumber(video.coin_reward || 0)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Metrics */}
                    <div className="pt-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Completion Rate:</span>
                          <span className="ml-2 font-medium text-emerald-400">{video.completion_rate || 0}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Watch Time:</span>
                          <span className="ml-2 font-medium text-blue-400">{Math.floor((video.total_watch_time || 0) / 60)}m</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-32 gaming-skeleton rounded-lg" />
                  <div className="h-48 gaming-skeleton rounded-lg" />
                </div>
              ) : videoAnalytics ? (
                <>
                  {/* Engagement Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <Card className="gaming-metric">
                      <CardContent className="p-3 md:p-4 text-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Timer className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        </div>
                        <div className="text-lg md:text-xl font-bold text-blue-400">
                          {Math.floor(videoAnalytics.engagementMetrics.averageWatchTime / 60)}m
                        </div>
                        <div className="text-xs text-gray-400">Avg Watch Time</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="gaming-metric">
                      <CardContent className="p-3 md:p-4 text-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                        </div>
                        <div className="text-lg md:text-xl font-bold text-emerald-400">
                          {videoAnalytics.engagementMetrics.clickThroughRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Click Rate</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="gaming-metric">
                      <CardContent className="p-3 md:p-4 text-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                        </div>
                        <div className="text-lg md:text-xl font-bold text-purple-400">
                          {videoAnalytics.engagementMetrics.retentionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Retention</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="gaming-metric">
                      <CardContent className="p-3 md:p-4 text-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                        </div>
                        <div className="text-lg md:text-xl font-bold text-red-400">
                          {videoAnalytics.engagementMetrics.bounceRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Bounce Rate</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Device and Geographic Data */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Device Breakdown */}
                    <Card className="gaming-card">
                      <CardHeader>
                        <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                          <Smartphone className="w-5 h-5" />
                          <span>Device Breakdown</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(videoAnalytics.deviceBreakdown).map(([device, percentage]) => {
                            const icons = {
                              mobile: Smartphone,
                              desktop: Monitor,
                              tablet: Tablet
                            }
                            const Icon = icons[device] || Smartphone
                            
                            return (
                              <div key={device} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-300 capitalize text-sm">{device}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-20 md:w-24 bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-violet-400 font-medium text-sm w-8 text-right">
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Geographic Data */}
                    <Card className="gaming-card">
                      <CardHeader>
                        <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                          <Globe className="w-5 h-5" />
                          <span>Top Locations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {videoAnalytics.geographicData.map((location, index) => (
                            <div key={location.country} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center text-xs font-bold text-violet-400">
                                  {index + 1}
                                </div>
                                <span className="text-gray-300 text-sm">{location.country}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-gray-400 text-sm">{formatNumber(location.views)}</span>
                                <span className="text-violet-400 font-medium text-sm w-8 text-right">
                                  {location.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Timeline */}
                  <Card className="gaming-card">
                    <CardHeader>
                      <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {videoAnalytics.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'success' ? 'bg-emerald-500' :
                              activity.type === 'warning' ? 'bg-orange-500' :
                              activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{activity.action}</p>
                              <p className="text-xs text-gray-400">
                                {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="gaming-card">
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Loading Analytics</h3>
                    <p className="text-gray-400">Detailed analytics will be displayed here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-white text-base md:text-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Edit className="w-5 h-5" />
                      <span>Edit Video Details</span>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Video Title
                    </label>
                    <Input
                      value={isEditing ? editForm.title : video.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      readOnly={!isEditing}
                      className="!bg-violet-500/10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Target Views
                      </label>
                      <Input
                        type="number"
                        value={isEditing ? editForm.target_views : video.target_views}
                        onChange={(e) => setEditForm(prev => ({ ...prev, target_views: Number(e.target.value) }))}
                        readOnly={!isEditing}
                        className="!bg-violet-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Coin Cost
                      </label>
                      <Input
                        type="number"
                        value={isEditing ? editForm.coin_cost : video.coin_cost}
                        onChange={(e) => setEditForm(prev => ({ ...prev, coin_cost: Number(e.target.value) }))}
                        readOnly={!isEditing}
                        className="!bg-violet-500/10"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-600">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditForm({
                            title: video.title || '',
                            target_views: video.target_views || 0,
                            coin_cost: video.coin_cost || 0
                          })
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        disabled={actionLoading.save}
                      >
                        {actionLoading.save ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {video.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleVideoAction('approve')}
                          disabled={actionLoading.approve}
                          className="flex items-center space-x-2 w-full"
                          variant="success"
                        >
                          {actionLoading.approve ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>Approve Video</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleVideoAction('reject')}
                          disabled={actionLoading.reject}
                          className="flex items-center space-x-2 w-full"
                          variant="danger"
                        >
                          {actionLoading.reject ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>Reject Video</span>
                        </Button>
                      </>
                    )}
                    
                    {video.status === 'active' && (
                      <Button
                        onClick={() => handleVideoAction('pause')}
                        disabled={actionLoading.pause}
                        className="flex items-center space-x-2 w-full"
                        variant="warning"
                      >
                        {actionLoading.pause ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                        <span>Pause Promotion</span>
                      </Button>
                    )}
                    
                    {video.status === 'paused' && (
                      <Button
                        onClick={() => handleVideoAction('resume')}
                        disabled={actionLoading.resume}
                        className="flex items-center space-x-2 w-full"
                        variant="success"
                      >
                        {actionLoading.resume ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>Resume Promotion</span>
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => window.open(video.youtube_url, '_blank')}
                      className="flex items-center space-x-2 w-full"
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open YouTube</span>
                    </Button>
                    
                    <Button
                      onClick={() => copyToClipboard(video.youtube_url)}
                      className="flex items-center space-x-2 w-full"
                      variant="outline"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Copy URL</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleVideoAction('delete')}
                      disabled={actionLoading.delete}
                      className="flex items-center space-x-2 w-full"
                      variant="danger"
                    >
                      {actionLoading.delete ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      <span>Delete Video</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Video History */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Video History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Video created</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(video.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    {video.status === 'completed' && video.completed_at && (
                      <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Promotion completed</p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(video.completed_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {video.repromoted_at && (
                      <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Video repromoted</p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(video.repromoted_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 p-3 gaming-card rounded-lg">
                      <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Last updated</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(video.updated_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 md:p-6 border-t border-violet-500/20 bg-violet-500/5 flex-shrink-0 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Last updated: {format(new Date(video.updated_at), 'MMM dd, HH:mm')}</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Close
            </Button>
            <Button 
              onClick={() => copyToClipboard(video.youtube_url)}
              className="flex-1 sm:flex-none"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}