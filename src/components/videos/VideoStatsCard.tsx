import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { formatNumber } from '../../lib/utils'

interface VideoStatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: 'violet' | 'emerald' | 'orange' | 'blue' | 'red' | 'purple'
  format?: 'number' | 'percentage' | 'currency' | 'time'
  trend?: number
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const colorClasses = {
  violet: {
    bg: 'bg-violet-500/20',
    text: 'text-violet-400',
    icon: 'text-violet-400',
    glow: 'shadow-violet-500/25'
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/25'
  },
  orange: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    icon: 'text-orange-400',
    glow: 'shadow-orange-500/25'
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/25'
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    icon: 'text-red-400',
    glow: 'shadow-red-500/25'
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    icon: 'text-purple-400',
    glow: 'shadow-purple-500/25'
  }
}

const sizeClasses = {
  sm: {
    card: 'p-3',
    icon: 'w-8 h-8',
    iconSize: 'w-4 h-4',
    value: 'text-lg',
    title: 'text-xs'
  },
  md: {
    card: 'p-4',
    icon: 'w-10 h-10',
    iconSize: 'w-5 h-5',
    value: 'text-xl',
    title: 'text-sm'
  },
  lg: {
    card: 'p-6',
    icon: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    value: 'text-2xl',
    title: 'text-base'
  }
}

export function VideoStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'violet',
  format = 'number',
  trend,
  subtitle,
  size = 'md',
  animated = false
}: VideoStatsCardProps) {
  const colors = colorClasses[color]
  const sizes = sizeClasses[size]
  
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'currency':
        return `$${val.toFixed(2)}`
      case 'time':
        return `${Math.floor(val / 60)}m ${val % 60}s`
      default:
        return formatNumber(val)
    }
  }

  return (
    <Card className={`gaming-metric hover:scale-[1.02] transition-all duration-300 ${animated ? 'gaming-pulse' : ''}`}>
      <CardContent className={`${sizes.card} text-center`}>
        <div className={`${sizes.icon} ${colors.bg} rounded-lg flex items-center justify-center mx-auto mb-3 ${colors.glow} shadow-lg`}>
          <Icon className={`${sizes.iconSize} ${colors.icon}`} />
        </div>
        
        <div className={`${sizes.value} font-bold ${colors.text} mb-1 gaming-text-shadow`}>
          {formatValue(value)}
        </div>
        
        <div className={`${sizes.title} text-gray-400 mb-1`}>{title}</div>
        
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
        
        {trend !== undefined && (
          <div className={`text-xs mt-1 flex items-center justify-center space-x-1 ${
            trend > 0 ? 'text-emerald-400' : 
            trend < 0 ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            <span>{trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}</span>
            <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}