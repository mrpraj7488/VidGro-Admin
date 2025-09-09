import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  User, 
  Clock, 
  Send, 
  Paperclip, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  CheckCircle,
  X,
  Calendar,
  Hash,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { format, formatDistanceToNow } from 'date-fns'
import { getSupabaseClient, getSupabaseAdminClient } from '../../lib/supabase'

interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'active' | 'pending' | 'answered' | 'closed'
  priority: 'low' | 'medium' | 'high'
  category: string
  reported_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  admin_replies: any[]
  user_messages: any[]
  attachments: any[]
  last_admin_reply?: string
  is_read: boolean
  resolution_notes?: string
}

interface TicketStats {
  total_tickets: number
  active_tickets: number
  pending_tickets: number
  answered_tickets: number
}

export function InboxView() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [userProfiles, setUserProfiles] = useState<Record<string, {username: string, email: string, avatar_url?: string}>>({})

  useEffect(() => {
    fetchTickets()
    fetchUserProfiles()
  }, [])

  useEffect(() => {
    // Background refresh for filters
    if (statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) {
      fetchTickets(true)
    }
  }, [statusFilter, priorityFilter, searchQuery])

  const fetchTickets = async (backgroundRefresh = false) => {
    if (backgroundRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const { data: ticketData, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Failed to fetch support tickets
        setTickets([])
        return
      }

      const transformedTickets: SupportTicket[] = (ticketData || []).map(transformTicket)
      setTickets(transformedTickets)
      calculateStats(transformedTickets)
    } catch (error) {
      // Failed to fetch tickets
      setTickets([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchUserProfiles = async () => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) return

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, email, avatar_url')

      if (error) {
        // Failed to fetch user profiles
        return
      }

      const profileMap: Record<string, {username: string, email: string, avatar_url?: string}> = {}
      profiles?.forEach(profile => {
        profileMap[profile.id] = {
          username: profile.username,
          email: profile.email,
          avatar_url: profile.avatar_url
        }
      })
      setUserProfiles(profileMap)
    } catch (error) {
      // Failed to fetch user profiles
    }
  }

  const transformTicket = (ticket: any): SupportTicket => ({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    reported_by: ticket.reported_by,
    assigned_to: ticket.assigned_to,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
    admin_replies: ticket.admin_replies || [],
    user_messages: ticket.user_messages || [],
    attachments: ticket.attachments || [],
    last_admin_reply: ticket.last_admin_reply,
    is_read: ticket.is_read || false,
    resolution_notes: ticket.resolution_notes
  })

  const calculateStats = (ticketList: SupportTicket[]) => {
    const stats = {
      total_tickets: ticketList.length,
      active_tickets: ticketList.filter(t => t.status === 'active').length,
      pending_tickets: ticketList.filter(t => t.status === 'pending').length,
      answered_tickets: ticketList.filter(t => t.status === 'answered').length,
    }
    setStats(stats)
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.reported_by.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesPriority && matchesSearch
  })

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) return

      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          is_read: true
        })
        .eq('id', ticketId)

      if (error) {
        // Failed to update ticket status
        return
      }

      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: status as any, updated_at: new Date().toISOString(), is_read: true } : ticket
      ))
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: status as any, updated_at: new Date().toISOString(), is_read: true } : null)
      }
    } catch (error) {
      // Error updating ticket status
    }
  }

  const sendReply = async (ticketId: string, message: string) => {
    if (!message.trim()) return

    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) return

      // Get current ticket status to determine next status
      const { data: currentTicket } = await supabase
        .from('support_tickets')
        .select('status')
        .eq('id', ticketId)
        .single()

      // Don't allow replies if ticket is closed
      if (currentTicket?.status === 'closed') {
        // Cannot reply to closed ticket
        return
      }

      // Send the reply message
      const { data, error } = await supabase.rpc('add_ticket_message', {
        p_ticket_id: ticketId,
        p_user_id: 'admin-1',
        p_message: message.trim(),
        p_is_admin: true,
        p_attachments: []
      })

      if (error) {
        // Failed to send reply
        return
      }

      // Seamlessly update ticket status to "answered" when admin replies
      const { error: statusError } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'answered',
          updated_at: new Date().toISOString(),
          is_read: true,
          last_admin_reply: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (statusError) {
        // Failed to update ticket status
      }

      // Clear reply message immediately for better UX
      setReplyMessage('')

      // Update local state optimistically
      const newReply = { 
        message: message.trim(), 
        created_at: new Date().toISOString(),
        id: `temp-${Date.now()}`
      }

      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { 
              ...t, 
              admin_replies: [...t.admin_replies, newReply],
              status: 'answered' as any,
              last_admin_reply: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_read: true
            } 
          : t
      ))

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? {
          ...prev,
          admin_replies: [...prev.admin_replies, newReply],
          status: 'answered' as any,
          last_admin_reply: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_read: true
        } : null)
      }

      // Refresh data in background to sync with server
      setTimeout(() => {
        fetchTickets(true)
      }, 1000)

    } catch (error) {
      // Error sending reply
    }
  }

  // Function to close a ticket (admin only)
  const closeTicket = async (ticketId: string, resolutionNotes?: string) => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) return

      // Update ticket status to closed
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || 'Ticket closed by admin'
        })
        .eq('id', ticketId)

      if (error) {
        // Failed to close ticket
        return
      }

      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { 
              ...t, 
              status: 'closed' as any,
              updated_at: new Date().toISOString(),
              resolution_notes: resolutionNotes || 'Ticket closed by admin'
            } 
          : t
      ))

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? {
          ...prev,
          status: 'closed' as any,
          updated_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || 'Ticket closed by admin'
        } : null)
      }

      // Refresh data in background
      setTimeout(() => {
        fetchTickets(true)
      }, 500)

    } catch (error) {
      // Error closing ticket
    }
  }

  const getUserDisplayName = (userId: string): string => {
    const profile = userProfiles[userId]
    if (profile) {
      return profile.username || profile.email
    }
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidPattern.test(userId)) {
      return `User ${userId.slice(0, 8)}`
    }
    
    return userId.includes('@') ? userId : userId
  }

  // Helper function to combine admin replies and user messages
  const getAllMessages = (ticket: SupportTicket) => {
    const messages: any[] = []
    
    // Add admin replies
    if (ticket.admin_replies) {
      ticket.admin_replies.forEach((reply: any) => {
        messages.push({
          ...reply,
          isAdmin: true,
          sender: 'Admin Support',
          timestamp: reply.created_at || new Date().toISOString()
        })
      })
    }
    
    // Add user messages
    if (ticket.user_messages) {
      ticket.user_messages.forEach((msg: any) => {
        messages.push({
          ...msg,
          isAdmin: false,
          sender: ticket.reported_by,
          timestamp: msg.created_at || new Date().toISOString()
        })
      })
    }
    
    // Sort by timestamp
    return messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUp className="w-4 h-4 text-orange-500" />
      case 'medium': return <Minus className="w-4 h-4 text-yellow-500" />
      case 'low': return <ArrowDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="warning" className="text-xs font-medium">High</Badge>
      case 'medium': return <Badge variant="info" className="text-xs font-medium">Medium</Badge>
      case 'low': return <Badge variant="success" className="text-xs font-medium">Low</Badge>
      default: return <Badge variant="default" className="text-xs font-medium">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="danger" className="text-xs font-medium">Active</Badge>
      case 'pending': return <Badge variant="warning" className="text-xs font-medium">Pending</Badge>
      case 'answered': return <Badge variant="info" className="text-xs font-medium">Answered</Badge>
      case 'closed': return <Badge variant="default" className="text-xs font-medium">Closed</Badge>
      default: return <Badge variant="default" className="text-xs font-medium">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 md:h-32 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
            Support Inbox
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Manage support tickets and customer communications
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button 
            onClick={() => fetchTickets()}
            variant="outline"
            size="sm"
            disabled={isLoading || isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="gaming-card">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 gaming-text-shadow">
              {stats?.total_tickets || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Tickets</div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 gaming-text-shadow">
              {stats?.active_tickets || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Active</div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 gaming-text-shadow">
              {stats?.pending_tickets || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 gaming-text-shadow">
              {stats?.answered_tickets || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Answered</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="gaming-card-enhanced overflow-visible relative z-50">
        <CardContent className="p-4 md:p-6 overflow-visible">
          <div className="flex flex-col lg:flex-row gap-4 overflow-visible">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets by title, description, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input min-w-[140px]"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Clear Filters */}
            <Button 
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setPriorityFilter('all')
              }}
              variant="outline"
              className="flex items-center space-x-2 min-w-[120px]"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="gaming-card-enhanced relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Support Tickets</span>
              <Badge variant="default" className="text-xs">
                {filteredTickets.length} tickets
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="divide-y divide-violet-500/20">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-violet-500/5 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-medium text-sm gaming-glow flex-shrink-0">
                        {userProfiles[ticket.reported_by]?.avatar_url ? (
                          <img
                            src={userProfiles[ticket.reported_by].avatar_url}
                            alt={userProfiles[ticket.reported_by].username}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {getUserDisplayName(ticket.reported_by).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getUserDisplayName(ticket.reported_by)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        {getPriorityIcon(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(ticket.created_at))} ago
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {ticket.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <Button 
                      onClick={() => setSelectedTicket(ticket)}
                      size="sm"
                      className="text-xs"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr className="border-b border-violet-500/20 bg-violet-500/5">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>User</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Subject</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Priority</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-violet-500/10 hover:bg-violet-500/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-medium text-xs gaming-glow flex-shrink-0">
                          {userProfiles[ticket.reported_by]?.avatar_url ? (
                            <img
                              src={userProfiles[ticket.reported_by].avatar_url}
                              alt={userProfiles[ticket.reported_by].username}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {getUserDisplayName(ticket.reported_by).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getUserDisplayName(ticket.reported_by)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {ticket.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(ticket.priority)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(ticket.created_at), 'HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Button 
                        onClick={() => setSelectedTicket(ticket)}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Tickets Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'Support tickets will appear here when submitted by users'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp-Style Chat Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gaming-modal max-w-4xl w-full h-[85vh] flex flex-col">
            {/* Minimized Header */}
            <div className="flex items-center justify-between p-3 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/50 to-purple-900/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                  {userProfiles[selectedTicket.reported_by]?.avatar_url ? (
                    <img
                      src={userProfiles[selectedTicket.reported_by].avatar_url}
                      alt={userProfiles[selectedTicket.reported_by].username}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : (
                    <span className="text-xs font-medium text-white">
                      {getUserDisplayName(selectedTicket.reported_by).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">{getUserDisplayName(selectedTicket.reported_by)}</h2>
                  <p className="text-xs text-gray-400">{selectedTicket.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedTicket.status} 
                  onChange={(e) => {
                    if (e.target.value === 'closed') {
                      closeTicket(selectedTicket.id)
                    } else {
                      updateTicketStatus(selectedTicket.id, e.target.value)
                    }
                  }}
                  className="px-2 py-1 border border-violet-500/30 rounded bg-violet-500/10 text-white text-xs gaming-input"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="answered">Answered</option>
                  <option value="closed">Closed</option>
                </select>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="h-8 w-8">
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>

            {/* Professional Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {/* Initial Message - User Left Side */}
              <div className="flex justify-start mb-4">
                <div className="flex items-start space-x-3 max-w-[75%]">
                  <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    {userProfiles[selectedTicket.reported_by]?.avatar_url ? (
                      <img
                        src={userProfiles[selectedTicket.reported_by].avatar_url}
                        alt={userProfiles[selectedTicket.reported_by].username}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {getUserDisplayName(selectedTicket.reported_by).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{getUserDisplayName(selectedTicket.reported_by)}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                        {format(new Date(selectedTicket.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{selectedTicket.description}</p>
                  </div>
                </div>
              </div>

              {/* Professional Chat Messages */}
              {getAllMessages(selectedTicket).map((message: any, index: number) => (
                <div key={message.id || index} className={`flex mb-4 ${
                  message.isAdmin ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`flex items-start space-x-3 max-w-[75%] ${
                    message.isAdmin ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      message.isAdmin 
                        ? 'bg-emerald-500 dark:bg-emerald-600' 
                        : 'bg-blue-500 dark:bg-blue-600'
                    }`}>
                      {!message.isAdmin && userProfiles[message.sender]?.avatar_url ? (
                        <img
                          src={userProfiles[message.sender].avatar_url}
                          alt={userProfiles[message.sender].username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {message.isAdmin ? 'A' : getUserDisplayName(message.sender).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-lg px-4 py-3 shadow-sm ${
                      message.isAdmin 
                        ? 'bg-emerald-500 dark:bg-emerald-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="mb-2">
                        <span className={`text-xs font-medium ${
                          message.isAdmin ? 'text-emerald-100' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {message.isAdmin ? 'Admin' : getUserDisplayName(message.sender)}
                        </span>
                        <span className={`text-xs ml-2 ${
                          message.isAdmin ? 'text-emerald-200' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {format(new Date(message.timestamp), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Professional Reply Box */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              {selectedTicket.status === 'closed' && (
                <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center font-medium">
                    This ticket is closed. Replies are disabled.
                  </p>
                </div>
              )}
              
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    placeholder={selectedTicket.status === 'closed' ? "Ticket is closed" : "Type your message..."}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    disabled={selectedTicket.status === 'closed'}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm transition-colors"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (replyMessage.trim() && selectedTicket.status !== 'closed') {
                          sendReply(selectedTicket.id, replyMessage)
                        }
                      }
                    }}
                  />
                </div>
                
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => sendReply(selectedTicket.id, replyMessage)}
                  disabled={!replyMessage.trim() || selectedTicket.status === 'closed'}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-11 px-6 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
