import React from 'react'
import { Search, Filter, SortAsc, SortDesc, Grid3X3, List, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent } from '../ui/Card'

interface VideoFiltersProps {
  filters: {
    search: string
    status: string
  }
  onFiltersChange: (filters: any) => void
  statusCounts: Record<string, number>
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onRefresh: () => void
  isRefreshing: boolean
  showMobileFilters: boolean
  onToggleMobileFilters: () => void
}

export function VideoFilters({
  filters,
  onFiltersChange,
  statusCounts,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing,
  showMobileFilters,
  onToggleMobileFilters
}: VideoFiltersProps) {
  return (
    <Card className="gaming-card-enhanced">
      <CardContent className="p-3 md:p-4">
        <div className="space-y-3">
          {/* Top Row - Search and Controls */}
          <div className="flex items-center space-x-2">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search videos, creators, or IDs..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10 text-sm md:text-base"
              />
            </div>
            
            {/* Mobile Filter Toggle */}
            <Button
              onClick={onToggleMobileFilters}
              variant="outline"
              size="sm"
              className="md:hidden"
            >
              <Filter className="w-4 h-4" />
            </Button>
            
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="px-2 py-1"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="px-2 py-1"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Refresh Button */}
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
          
          {/* Filters Row - Collapsible on Mobile */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ status: e.target.value })}
                className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input flex-1 sm:flex-none sm:min-w-[140px]"
              >
                <option value="all">All Status ({statusCounts.all || 0})</option>
                <option value="active">Active ({statusCounts.active || 0})</option>
                <option value="completed">Completed ({statusCounts.completed || 0})</option>
                <option value="pending">Pending ({statusCounts.pending || 0})</option>
                <option value="on_hold">On Hold ({statusCounts.on_hold || 0})</option>
                <option value="paused">Paused ({statusCounts.paused || 0})</option>
                <option value="repromoted">Repromoted ({statusCounts.repromoted || 0})</option>
                <option value="deleted">Deleted ({statusCounts.deleted || 0})</option>
                <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, sortOrder)}
                className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input flex-1 sm:flex-none sm:min-w-[120px]"
              >
                <option value="created_at">Date Created</option>
                <option value="views_count">View Count</option>
                <option value="coin_cost">Coins Spent</option>
                <option value="completion_rate">Completion Rate</option>
                <option value="total_watch_time">Watch Time</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
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
  )
}