import React, { useState, useEffect } from 'react'
import { Activity, Users, Video, Coins, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { format } from 'date-fns'

interface RealtimeUpdate {
  id: string
  type: 'user_joined' | 'video_uploaded' | 'coin_transaction' | 'video_completed'
  message: string
  timestamp: Date
  value?: string
  userId?: string
  videoId?: string
}

export function RealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Simulate real-time updates for demo
    const interval = setInterval(() => {
      const updateTypes = [
        { type: 'user_joined', message: 'New user registered', icon: Users },
        { type: 'video_uploaded', message: 'Video uploaded for promotion', icon: Video },
        { type: 'coin_transaction', message: 'Coins purchased', icon: Coins },
        { type: 'video_completed', message: 'Video promotion completed', icon: TrendingUp }
      ]

      const randomUpdate = updateTypes[Math.floor(Math.random() * updateTypes.length)]
      const newUpdate: RealtimeUpdate = {
        id: `update-${Date.now()}`,
        type: randomUpdate.type as any,
        message: randomUpdate.message,
        timestamp: new Date(),
        value: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 100)}` : undefined
      }

      setUpdates(prev => [newUpdate, ...prev.slice(0, 9)]) // Keep last 10 updates
    }, 5000 + Math.random() * 10000) // Random interval between 5-15 seconds

    return () => clearInterval(interval)
  }, [])

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'user_joined': return <Users className="w-4 h-4 text-violet-500" />
      case 'video_uploaded': return <Video className="w-4 h-4 text-emerald-500" />
      case 'coin_transaction': return <Coins className="w-4 h-4 text-orange-500" />
      case 'video_completed': return <TrendingUp className="w-4 h-4 text-blue-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'user_joined': return 'border-l-violet-500 bg-violet-50/50 dark:bg-violet-900/20'
      case 'video_uploaded': return 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
      case 'coin_transaction': return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/20'
      case 'video_completed': return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
      default: return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/20'
    }
  }

  return (
    <Card className="gaming-card-enhanced">
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm md:text-base">Live Updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 gaming-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <div className="space-y-2 max-h-64 overflow-y-auto gaming-scrollbar">
          {updates.length > 0 ? (
            updates.map((update) => (
              <div 
                key={update.id} 
                className={`flex items-center space-x-3 p-2 md:p-3 rounded-lg border-l-4 transition-all duration-300 hover:scale-[1.01] ${getUpdateColor(update.type)}`}
              >
                <div className="flex-shrink-0">
                  {getUpdateIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {update.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(update.timestamp, 'HH:mm:ss')}
                  </p>
                </div>
                {update.value && (
                  <Badge variant="default" className="text-xs flex-shrink-0">
                    {update.value}
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waiting for live updates...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}