import React from 'react'
import { DivideIcon as LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { formatNumber, formatCurrency } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: number
  change?: number
  icon: LucideIcon
  format?: 'number' | 'currency' | 'percentage'
  color?: 'violet' | 'emerald' | 'orange' | 'blue'
}

const colorClasses = {
  violet: {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/25',
    text: 'text-violet-600 dark:text-violet-400'
  },
  emerald: {
    gradient: 'from-emerald-500 to-green-600',
    glow: 'shadow-emerald-500/25',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  orange: {
    gradient: 'from-orange-500 to-amber-600',
    glow: 'shadow-orange-500/25',
    text: 'text-orange-600 dark:text-orange-400'
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/25',
    text: 'text-blue-600 dark:text-blue-400'
  }
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = 'number',
  color = 'violet' 
}: StatsCardProps) {
  const formatValue = (val: number) => {
    // Handle undefined, null, or non-numeric values
    if (val === undefined || val === null || isNaN(val)) {
      return '0'
    }
    
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val}%`
      default:
        return formatNumber(val)
    }
  }

  const colors = colorClasses[color]

  return (
    <Card className="gaming-metric gaming-shine-enhanced group gaming-interactive hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-3 md:p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 gaming-text-shadow truncate">
              {title}
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold gaming-gradient-text gaming-text-shadow">
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-1 md:mt-2">
                <span className={`text-xs md:text-sm font-medium ${
                  change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center shadow-lg ${colors.glow} gaming-glow gaming-sparkle flex-shrink-0 ml-2 md:ml-4`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white gaming-icon-glow" strokeWidth={2} />
          </div>
        </div>
        
        {/* Mobile-specific progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg" />
      </CardContent>
    </Card>
  )
}