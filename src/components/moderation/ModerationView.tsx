import React, { useEffect, useState } from 'react'
import { Shield, Flag, Eye, CheckCircle, XCircle, AlertTriangle, Search, Filter } from 'lucide-react'
import { useAdminStore } from '../../stores/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { formatNumber } from '../../lib/utils'
import { format } from 'date-fns'

export function ModerationView() {
  const { moderationData, isLoading, fetchModerationData, moderateContent } = useAdminStore()
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all'
  })

  useEffect(() => {
    fetchModerationData()
  }, [fetchModerationData])

  const handleModerate = async (itemId: string, action: 'approve' | 'reject' | 'flag') => {
    await moderateContent(itemId, action)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">High Priority</Badge>
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>
      case 'low':
        return <Badge variant="info">Low Priority</Badge>
      default:
        return <Badge variant="default">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'flagged':
        return <Badge variant="danger">Flagged</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  if (isLoading || !moderationData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl" />
      </div>
    )
  }

  const filteredItems = moderationData.pendingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.username.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === 'all' || item.status === filters.status
    const matchesPriority = filters.priority === 'all' || item.priority === filters.priority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600">Review and moderate user-generated content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="warning" className="text-sm">
            {moderationData.pendingCount} items pending
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-orange-600">{moderationData.pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved Today</p>
                <p className="text-3xl font-bold text-emerald-600">{moderationData.approvedToday}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Flagged Content</p>
                <p className="text-3xl font-bold text-red-600">{moderationData.flaggedCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search content by title or creator..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Queue */}
      <div className="grid grid-cols-1 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                {/* Content Preview */}
                <div className="w-48 h-32 bg-gray-100 flex-shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {item.username}</p>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(item.status)}
                        {getPriorityBadge(item.priority)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Reported: {format(new Date(item.reportedAt), 'MMM dd, HH:mm')}</p>
                      <p>{item.reportCount} reports</p>
                    </div>
                  </div>
                  
                  {/* Report Reasons */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Report Reasons:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.reportReasons.map((reason, index) => (
                        <Badge key={index} variant="default" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleModerate(item.id, 'approve')}
                      className="flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleModerate(item.id, 'reject')}
                      className="flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerate(item.id, 'flag')}
                      className="flex items-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Flag</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{moderationData.stats.totalReviewed}</div>
              <div className="text-sm text-gray-500">Total Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{moderationData.stats.approvalRate}%</div>
              <div className="text-sm text-gray-500">Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{moderationData.stats.avgResponseTime}h</div>
              <div className="text-sm text-gray-500">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">{moderationData.stats.activeReports}</div>
              <div className="text-sm text-gray-500">Active Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}