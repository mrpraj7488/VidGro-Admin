import React from 'react'
import { TrendingUp, Target } from 'lucide-react'
import { formatNumber } from '../../lib/utils'

interface VideoProgressBarProps {
  current: number
  target: number
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  color?: 'violet' | 'emerald' | 'orange' | 'blue'
}

export function VideoProgressBar({ 
  current, 
  target, 
  showLabels = true, 
  size = 'md',
  animated = true,
  color = 'violet'
}: VideoProgressBarProps) {
  const percentage = Math.min(100, (current / target) * 100)
  const isCompleted = percentage >= 100
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const colorClasses = {
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-green-600',
    orange: 'from-orange-500 to-amber-600',
    blue: 'from-blue-500 to-cyan-600'
  }

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
            <TrendingUp className="w-4 h-4" />
            <span>Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${
              isCompleted ? 'text-emerald-500' : 'text-violet-500'
            }`}>
              {percentage.toFixed(1)}%
            </span>
            {isCompleted && (
              <div className="flex items-center space-x-1 text-emerald-500">
                <Target className="w-3 h-3" />
                <span className="text-xs font-medium">Complete</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-slate-700 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div 
          className={`bg-gradient-to-r ${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 relative ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>
      
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatNumber(current)} current</span>
          <span>{formatNumber(target)} target</span>
        </div>
      )}
    </div>
  )
}