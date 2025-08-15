import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { formatNumber, formatCurrency } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: number | string
  previousValue?: number
  format?: 'number' | 'currency' | 'percentage' | 'time'
  icon?: React.ComponentType<any>
  color?: 'violet' | 'emerald' | 'orange' | 'blue' | 'red'
  size?: 'sm' | 'md' | 'lg'
}

export function MetricCard({ 
  title, 
  value, 
  previousValue, 
  format = 'number',
  icon: Icon,
  color = 'violet',
  size = 'md'
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'time':
        return `${Math.floor(val / 60)}m ${val % 60}s`
      default:
        return formatNumber(val)
    }
  }

  const calculateChange = () => {
    if (typeof value === 'string' || !previousValue || previousValue === 0) return null
    return ((value - previousValue) / previousValue) * 100
  }

  const change = calculateChange()
  const isPositive = change !== null && change > 0
  const isNegative = change !== null && change < 0

  const colorClasses = {
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
  }

  const sizeClasses = {
    sm: {
      card: 'p-3',
      icon: 'w-8 h-8',
      iconSize: 'w-4 h-4',
      title: 'text-xs',
      value: 'text-lg',
      change: 'text-xs'
    },
    md: {
      card: 'p-4',
      icon: 'w-10 h-10',
      iconSize: 'w-5 h-5',
      title: 'text-sm',
      value: 'text-xl md:text-2xl',
      change: 'text-sm'
    },
    lg: {
      card: 'p-6',
      icon: 'w-12 h-12',
      iconSize: 'w-6 h-6',
      title: 'text-base',
      value: 'text-2xl md:text-3xl',
      change: 'text-base'
    }
  }

  const classes = sizeClasses[size]

  return (
    <Card className="gaming-card-enhanced hover:scale-[1.02] transition-all duration-300">
      <CardContent className={classes.card}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className={`${classes.title} font-medium text-gray-600 dark:text-gray-300 mb-1 truncate`}>
              {title}
            </p>
            <p className={`${classes.value} font-bold text-gray-900 dark:text-white gaming-text-shadow`}>
              {formatValue(value)}
            </p>
            {change !== null && (
              <div className="flex items-center mt-1">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
                ) : isNegative ? (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-500 mr-1" />
                )}
                <span className={`${classes.change} font-medium ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                  isNegative ? 'text-red-600 dark:text-red-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`${classes.icon} ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
              <Icon className={`${classes.iconSize}`} strokeWidth={2} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardMetricsProps {
  stats: any
  loading?: boolean
}

export function DashboardMetrics({ stats, loading }: DashboardMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 md:h-24 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <MetricCard
        title="Response Time"
        value="45ms"
        color="emerald"
        size="sm"
      />
      <MetricCard
        title="Error Rate"
        value={0.1}
        format="percentage"
        color="red"
        size="sm"
      />
      <MetricCard
        title="Active Sessions"
        value={stats?.daily_active_users || 0}
        color="blue"
        size="sm"
      />
      <MetricCard
        title="Cache Hit Rate"
        value={98.5}
        format="percentage"
        color="violet"
        size="sm"
      />
    </div>
  )
}