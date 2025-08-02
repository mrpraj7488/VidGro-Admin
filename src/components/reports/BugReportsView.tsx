import React, { useEffect, useState } from 'react'
import { Bug, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, User, Calendar } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { CreateBugModal } from './CreateBugModal'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

export function BugReportsView() {
  const { bugReportData, isLoading, fetchBugReports, updateBugStatus, assignBug } = useAdminStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all'
  })

  useEffect(() => {
    fetchBugReports()
  }, [fetchBugReports])

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger" className="font-medium">Critical</Badge>
      case 'high':
        return <Badge variant="danger" className="font-medium">High</Badge>
      case 'medium':
        return <Badge variant="warning" className="font-medium">Medium</Badge>
      case 'low':
        return <Badge variant="info" className="font-medium">Low</Badge>
      default:
        return <Badge variant="default" className="font-medium">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="warning" className="font-medium">New</Badge>
      case 'in_progress':
        return <Badge variant="info" className="font-medium">In Progress</Badge>
      case 'fixed':
        return <Badge variant="success" className="font-medium">Fixed</Badge>
      case 'wont_fix':
        return <Badge variant="default" className="font-medium">Won't Fix</Badge>
      default:
        return <Badge variant="default" className="font-medium">{status}</Badge>
    }
  }

  const filteredBugs = bugReportData.bugReports.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         bug.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         bug.reported_by.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === 'all' || bug.status === filters.status
    const matchesPriority = filters.priority === 'all' || bug.priority === filters.priority
    const matchesCategory = filters.category === 'all' || bug.category === filters.category
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center animate-slide-down">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bug Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage application issues and bugs</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Report Bug</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-stagger-children">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/50 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">New Bugs</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {bugReportData ? bugReportData.newBugs : '--'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Bug className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-700/50 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Bugs Fixed Today</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {bugReportData ? bugReportData.bugsFixedToday : '--'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-slide-up">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bugs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="fixed">Fixed</option>
              <option value="wont_fix">Won't Fix</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Categories</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Backend">Backend</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Payment">Payment</option>
              <option value="Video Processing">Video Processing</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bug Reports List */}
      <div className="space-y-4 animate-stagger-children">
        {bugReportData && filteredBugs.length > 0 ? (
          filteredBugs.map((bug) => (
          <Card key={bug.bug_id} className="hover:shadow-md transition-all duration-300 dark:hover:shadow-slate-900/40 animate-slide-up hover:scale-[1.01]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{bug.title}</h3>
                    {getStatusBadge(bug.status)}
                    {getPriorityBadge(bug.priority)}
                    <Badge variant="default" className="text-xs">{bug.category}</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{bug.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Reported by {bug.reported_by}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(bug.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    {bug.assigned_to && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Assigned to {bug.assigned_to}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {bug.status === 'new' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateBugStatus(bug.bug_id, 'in_progress')}
                    >
                      Start Work
                    </Button>
                  )}
                  {bug.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => updateBugStatus(bug.bug_id, 'fixed')}
                    >
                      Mark Fixed
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        ) : bugReportData && filteredBugs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bug className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bug reports found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or create a new bug report.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                      
                      <div className="flex items-center space-x-6">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Bug Modal */}
      <CreateBugModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}