import React from 'react'
import { DivideIcon as LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { formatNumber, formatCurrency } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: number
  change: number
  icon: LucideIcon
  format?: 'number' | 'currency' | 'percentage'
  color?: 'violet' | 'emerald' | 'orange' | 'blue'
}

const colorClasses = {
  violet: 'from-violet-500 to-purple-600',
  emerald: 'from-emerald-500 to-green-600',
  orange: 'from-orange-500 to-amber-600',
  blue: 'from-blue-500 to-cyan-600'
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
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val}%`
      default:
        return formatNumber(val)
    }
  }

  return (
    <Card className="gaming-metric gaming-shine-enhanced group gaming-interactive">
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 gaming-text-shadow">{title}</p>
            <p className="gaming-metric-value">{formatValue(value)}</p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-lg gaming-glow gaming-sparkle`}>
            <Icon className="w-6 h-6 text-white gaming-icon-glow" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}