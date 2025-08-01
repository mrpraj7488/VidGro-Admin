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
    <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-violet-50 opacity-0 group-hover:opacity-50 transition-opacity duration-200 pointer-events-none" />
    </Card>
  )
}