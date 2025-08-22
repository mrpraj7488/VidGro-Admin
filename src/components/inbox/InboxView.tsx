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
  Bell,
  Users,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { BulkNotificationModal } from '../users/BulkNotificationModal'
import { format, formatDistanceToNow } from 'date-fns'
import { getSupabaseClient, getSupabaseAdminClient } from '../../lib/supabase'
import { Download } from 'lucide-react'

interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'active' | 'pending' | 'answered' | 'completed' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
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

export function InboxView() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTickets()
    
    // Set up real-time subscription
    const supabase = getSupabaseAdminClient()
    if (!supabase) return

    const subscription = supabase
      .channel('support_tickets_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_tickets' 
        },
        (payload) => {
          console.log('Ticket change received:', payload)
          if (payload.eventType === 'INSERT') {
            setTickets(prev => [transformTicket(payload.new), ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTickets(prev => prev.map(t => 
              t.id === payload.new.id ? transformTicket(payload.new) : t
            ))
            if (selectedTicket?.id === payload.new.id) {
              setSelectedTicket(transformTicket(payload.new))
            }
          } else if (payload.eventType === 'DELETE') {
            setTickets(prev => prev.filter(t => t.id !== payload.old.id))
            if (selectedTicket?.id === payload.old.id) {
              setSelectedTicket(null)
            }
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Get support tickets from database
      const { data: ticketData, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch support tickets:', error)
        setTickets([])
        return
      }

      // Use ticket data directly from database
      const transformedTickets: SupportTicket[] = (ticketData || []).map(transformTicket)

      setTickets(transformedTickets)
      console.log('Support tickets fetched:', transformedTickets.length)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.reported_by.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
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
        console.error('Failed to update ticket status:', error)
        return
      }

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: status as any, updated_at: new Date().toISOString(), is_read: true } : ticket
      ))
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: status as any, updated_at: new Date().toISOString(), is_read: true } : null)
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const sendReply = async (ticketId: string, message: string) => {
    if (!message.trim()) return

    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) return

      const newReply = {
        id: `reply-${Date.now()}`,
        adminId: 'admin-1',
        adminName: 'Admin Support',
        message: message.trim(),
        timestamp: new Date().toISOString()
      }

      // Get current ticket
      const ticket = tickets.find(t => t.id === ticketId)
      if (!ticket) return

      const updatedAdminReplies = [...(ticket.admin_replies || []), newReply]
      const newStatus = ticket.status === 'active' ? 'answered' : ticket.status

      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          admin_replies: updatedAdminReplies,
          status: newStatus,
          last_admin_reply: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) {
        console.error('Failed to send reply:', error)
        return
      }

      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { 
              ...t, 
              admin_replies: updatedAdminReplies,
              status: newStatus as any,
              last_admin_reply: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } 
          : t
      ))

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? {
          ...prev,
          admin_replies: updatedAdminReplies,
          status: newStatus as any,
          last_admin_reply: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : null)
      }

      setReplyMessage('')
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  // Removed bulk notification and email features - not needed for support tickets

  return (
    <>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white gaming-text-shadow">
              Support Inbox
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage support tickets and send notifications
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={fetchTickets}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        <div className="h-[calc(100vh-12rem)] flex gaming-card !p-0 overflow-hidden">
      {/* Ticket List Sidebar */}
          <div className="w-1/3 border-r border-violet-500/20 bg-violet-500/5 flex flex-col">
            <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Mail className="h-5 w-5 text-violet-500 dark:text-violet-400 gaming-glow" />
              Support Inbox
            </h2>
              <Badge variant="danger" className="gaming-pulse">
              {tickets.filter(t => t.status === 'active').length} Active
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-violet-500/10 border-violet-500/30"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm dark:text-white gaming-input"
          >
            <option value="all">All Tickets</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        {/* Ticket List */}
          <div className="flex-1 overflow-y-auto gaming-scrollbar">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No support tickets found</p>
              <p className="text-sm">Tickets will appear here when submitted</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-violet-500/10 cursor-pointer hover:bg-violet-500/10 transition-all duration-300 gaming-interactive ${
                  selectedTicket?.id === ticket.id ? 'bg-violet-500/20 border-l-4 border-l-violet-500 gaming-glow' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(ticket.priority)}
                    <Badge variant={getStatusVariant(ticket.status)} className="text-xs">
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground dark:text-gray-400">
                  {formatDistanceToNow(new Date(ticket.created_at))} ago
                </span>
              </div>
              
              <h3 className="font-medium text-sm mb-1 line-clamp-1">
                {ticket.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
                <User className="h-3 w-3" />
                <span>{ticket.reported_by}</span>
                <span>•</span>
                <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
              </div>
              
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">
                {ticket.description}
              </p>
            </div>
          )))}
        </div>
      </div>
      
      {/* Ticket Detail View */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
              <div className="p-6 border-b border-violet-500/20 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold mb-2 dark:text-white">{selectedTicket.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{selectedTicket.reported_by}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(selectedTicket.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityVariant(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <select 
                    value={selectedTicket.status} 
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                      className="px-3 py-1 border border-violet-500/30 rounded text-sm bg-violet-500/10 dark:text-white gaming-input"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="answered">Answered</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Conversation Thread */}
              <div className="flex-1 p-6 overflow-y-auto gaming-scrollbar">
              <div className="space-y-6">
                {/* Original Message */}
                  <div className="bg-violet-500/10 dark:bg-slate-800/50 rounded-lg p-4 gaming-card">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-full flex items-center justify-center">
                        <span className="text-violet-600 dark:text-violet-400 font-medium text-sm">
                        {selectedTicket.reported_by.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm dark:text-white">{selectedTicket.reported_by}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        {format(new Date(selectedTicket.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none dark:text-gray-300">
                    <p>{selectedTicket.description}</p>
                    {/* Show original attachments if any */}
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Attachments:</p>
                        {selectedTicket.attachments.map((attachment: any, idx: number) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            {attachment.name || `Attachment ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Admin Replies and User Messages */}
                {getAllMessages(selectedTicket).map((message) => (
                  <div key={message.id} className={`rounded-lg p-4 ${
                    message.isAdmin 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-400 gaming-card' 
                        : 'bg-violet-50 dark:bg-violet-900/20 border-l-4 border-l-violet-400 gaming-card'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isAdmin 
                          ? "bg-green-100 dark:bg-green-900/50" 
                          : "bg-violet-100 dark:bg-violet-900/50"
                      }`}>
                        <span className={`font-medium text-sm ${
                          message.isAdmin 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-violet-600 dark:text-violet-400"
                        }`}>
                          {message.sender.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2 dark:text-white">
                          {message.sender}
                          {message.isAdmin && (
                            <Badge variant="success" className="text-xs">
                              Admin Reply
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                          {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none dark:text-gray-300">
                      <p>{message.message}</p>
                      {/* Show attachments if any */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Attachments:</p>
                          {message.attachments.map((attachment: any, idx: number) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                            >
                              <Download className="w-3 h-3" />
                              {attachment.name || `Attachment ${idx + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reply Section */}
              <div className="p-6 border-t border-violet-500/20 bg-violet-500/5 dark:bg-slate-800/30">
              {selectedTicket.status === 'closed' && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This ticket is closed. Replies are disabled.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium dark:text-white">Reply to {selectedTicket.reported_by}</h3>
                </div>
                
                <textarea
                  placeholder={selectedTicket.status === 'closed' ? "Ticket is closed" : "Type your response..."}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={selectedTicket.status === 'closed'}
                  className="w-full px-3 py-2 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 min-h-[100px] bg-violet-500/10 dark:text-white gaming-input disabled:opacity-50 disabled:cursor-not-allowed"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-1" />
                      Attach File
                    </Button>
                    <Button variant="outline" onClick={() => setReplyMessage('')}>
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                    onClick={() => sendReply(selectedTicket.id, replyMessage)}
                    disabled={!replyMessage.trim() || selectedTicket.status === 'closed'}
                    className="gaming-button"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {selectedTicket.status === 'closed' ? 'Ticket Closed' : 'Send Reply'}
                  </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
                <Mail className="h-12 w-12 mb-4 mx-auto opacity-50 text-violet-500" />
              <p>Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Removed bulk notification modal - not needed */}
    </>
  )
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'urgent': return <AlertTriangle className="h-3 w-3 text-red-500" />
    case 'high': return <ArrowUp className="h-3 w-3 text-orange-500" />
    case 'medium': return <Minus className="h-3 w-3 text-yellow-500" />
    case 'low': return <ArrowDown className="h-3 w-3 text-green-500" />
    default: return <Minus className="h-3 w-3 text-gray-500" />
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'danger'
    case 'pending': return 'warning'
    case 'answered': return 'info'
    case 'completed': return 'success'
    case 'closed': return 'default'
    default: return 'default'
  }
}

// Helper function to combine admin replies and user messages
const getAllMessages = (ticket: SupportTicket) => {
  const messages: any[] = []
  
  // Add admin replies
  if (ticket.admin_replies) {
    ticket.admin_replies.forEach(reply => {
      messages.push({
        ...reply,
        isAdmin: true,
        sender: reply.adminName || 'Admin Support'
      })
    })
  }
  
  // Add user messages
  if (ticket.user_messages) {
    ticket.user_messages.forEach(msg => {
      messages.push({
        ...msg,
        isAdmin: false,
        sender: ticket.reported_by
      })
    })
  }
  
  // Sort by timestamp
  return messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'danger'
    case 'high': return 'warning'
    case 'medium': return 'default'
    case 'low': return 'success'
    default: return 'default'
  }
}
