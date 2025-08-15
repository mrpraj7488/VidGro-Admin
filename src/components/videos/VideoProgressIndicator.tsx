import React from 'react'
import { Target, TrendingUp, Clock, Award } from 'lucide-react'
import { formatNumber } from '../../lib/utils'

interface VideoProgressIndicatorProps {
  current: number
  target: number
  completionRate?: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function VideoProgressIndicator({ 
  current, 
  target, 
  completionRate = 0,
  showDetails = true, 
  size = 'md',
  animated = true
}: VideoProgressIndicatorProps) {
  const percentage = Math.min(100, (current / target) * 100)
  const isCompleted = percentage >= 100
  const isNearCompletion = percentage >= 80
  
  const sizeClasses = {
    sm: { bar: 'h-1.5', text: 'text-xs', icon: 'w-3 h-3' },
    md: { bar: 'h-2', text: 'text-sm', icon: 'w-4 h-4' },
    lg: { bar: 'h-3', text: 'text-base', icon: 'w-5 h-5' }
  }
  
  const classes = sizeClasses[size]

  return (
    <div className="space-y-2">
      {showDetails && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
            <Target className={`${classes.icon} ${isCompleted ? 'text-emerald-500' : 'text-violet-500'}`} />
            <span className={`${classes.text} font-medium`}>Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`${classes.text} font-bold ${
              isCompleted ? 'text-emerald-500' : 
              isNearCompletion ? 'text-orange-500' : 
              'text-violet-500'
            }`}>
              {percentage.toFixed(1)}%
            </span>
            {isCompleted && (
              <Award className="w-4 h-4 text-emerald-500" />
            )}
          </div>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-slate-700 rounded-full ${classes.bar} overflow-hidden`}>
        <div 
          className={`${classes.bar} rounded-full transition-all duration-500 relative ${
            isCompleted ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
            isNearCompletion ? 'bg-gradient-to-r from-orange-500 to-amber-600' :
            'bg-gradient-to-r from-violet-500 to-purple-600'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Eye className={`${classes.icon} text-gray-400`} />
            <span className={`${classes.text} text-gray-500 dark:text-gray-400`}>
              {formatNumber(current)} current
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className={`${classes.icon} text-gray-400`} />
            <span className={`${classes.text} text-gray-500 dark:text-gray-400`}>
              {formatNumber(target)} target
            </span>
          </div>
        </div>
      )}
      
      {completionRate > 0 && showDetails && (
        <div className="flex items-center justify-center pt-1">
          <div className="flex items-center space-x-1 text-emerald-500">
            <Award className="w-3 h-3" />
            <span className="text-xs font-medium">{completionRate}% completion rate</span>
          </div>
        </div>
      )}
    </div>
  )
}