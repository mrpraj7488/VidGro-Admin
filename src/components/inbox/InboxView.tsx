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

interface SupportTicket {
  id: string
  userId: string
  username: string
  email: string
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general'
  createdAt: string
  updatedAt: string
  adminReplies: AdminReply[]
}

interface AdminReply {
  id: string
  adminId: string
  adminName: string
  message: string
  timestamp: string
  isInternal: boolean
}

const mockTickets: SupportTicket[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ticket-${i + 1}`,
  userId: `user-${i + 1}`,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  subject: [
    'Unable to upload video',
    'Coin transaction failed',
    'VIP upgrade not working',
    'App crashes on startup',
    'Video promotion not showing',
    'Payment processing error',
    'Account verification issue',
    'Feature request: Dark mode',
    'Bug: Video thumbnail missing',
    'Help with coin withdrawal',
    'Profile picture upload fails',
    'Notification settings broken'
  ][i],
  message: `Detailed description of the issue for ticket ${i + 1}. This is a comprehensive explanation of what the user is experiencing and what they need help with.`,
  status: ['new', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)] as any,
  priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
  category: ['technical', 'billing', 'feature_request', 'bug_report', 'general'][Math.floor(Math.random() * 5)] as any,
  createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  adminReplies: Math.random() > 0.5 ? [
    {
      id: `reply-${i + 1}-1`,
      adminId: 'admin-1',
      adminName: 'Admin Support',
      message: 'Thank you for contacting us. We are looking into this issue and will get back to you shortly.',
      timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
      isInternal: false
    }
  ] : []
}))

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
    case 'new': return 'danger'
    case 'in_progress': return 'warning'
    case 'resolved': return 'success'
    case 'closed': return 'default'
    default: return 'default'
  }
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

export function InboxView() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isInternal, setIsInternal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isBulkNotificationOpen, setIsBulkNotificationOpen] = useState(false)
  const [isComposeEmailOpen, setIsComposeEmailOpen] = useState(false)
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<string | null>(null)

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const updateTicketStatus = (ticketId: string, status: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: status as any, updatedAt: new Date().toISOString() } : ticket
    ))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: status as any, updatedAt: new Date().toISOString() } : null)
    }
  }

  const sendReply = (ticketId: string, message: string) => {
    if (!message.trim()) return

    const newReply: AdminReply = {
      id: `reply-${Date.now()}`,
      adminId: 'admin-1',
      adminName: 'Admin Support',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isInternal
    }

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            adminReplies: [...ticket.adminReplies, newReply],
            status: ticket.status === 'new' ? 'in_progress' : ticket.status,
            updatedAt: new Date().toISOString()
          } 
        : ticket
    ))

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? {
        ...prev,
        adminReplies: [...prev.adminReplies, newReply],
        status: prev.status === 'new' ? 'in_progress' : prev.status,
        updatedAt: new Date().toISOString()
      } : null)
    }

    setReplyMessage('')
    setIsInternal(false)
  }

  const handleSendBulkNotification = async (notification: any) => {
    console.log('Sending bulk notification:', notification)
    // TODO: Implement actual bulk notification sending
  }

  const handleComposeEmail = (userId?: string) => {
    setSelectedUserForEmail(userId || null)
    setIsComposeEmailOpen(true)
  }

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
              onClick={() => setIsBulkNotificationOpen(true)}
              className="flex items-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>Bulk Notification</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleComposeEmail()}
              className="flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Compose Email</span>
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
              {tickets.filter(t => t.status === 'new').length} New
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
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        {/* Ticket List */}
          <div className="flex-1 overflow-y-auto gaming-scrollbar">
          {filteredTickets.map((ticket) => (
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
                  {formatDistanceToNow(new Date(ticket.createdAt))} ago
                </span>
              </div>
              
              <h3 className="font-medium text-sm mb-1 line-clamp-1">
                {ticket.subject}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
                <User className="h-3 w-3" />
                <span>{ticket.username}</span>
                <span>•</span>
                <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
              </div>
              
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">
                {ticket.message}
              </p>
            </div>
          ))}
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
                  <h1 className="text-xl font-semibold mb-2 dark:text-white">{selectedTicket.subject}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{selectedTicket.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{selectedTicket.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy HH:mm')}</span>
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
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
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
                        {selectedTicket.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm dark:text-white">{selectedTicket.username}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        {format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none dark:text-gray-300">
                    <p>{selectedTicket.message}</p>
                  </div>
                </div>
                
                {/* Admin Replies */}
                {selectedTicket.adminReplies.map((reply) => (
                  <div key={reply.id} className={`rounded-lg p-4 ${
                    reply.isInternal 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-l-orange-400 gaming-card' 
                        : 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-400 gaming-card'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        reply.isInternal 
                          ? "bg-orange-100 dark:bg-orange-900/50" 
                          : "bg-green-100 dark:bg-green-900/50"
                      }`}>
                        <span className={`font-medium text-sm ${
                          reply.isInternal 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-green-600 dark:text-green-400"
                        }`}>
                          {reply.adminName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2 dark:text-white">
                          {reply.adminName}
                          {reply.isInternal && (
                            <Badge variant="warning" className="text-xs">
                              Internal Note
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                          {format(new Date(reply.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none dark:text-gray-300">
                      <p>{reply.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reply Section */}
              <div className="p-6 border-t border-violet-500/20 bg-violet-500/5 dark:bg-slate-800/30">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium dark:text-white">Reply to {selectedTicket.username}</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal-note"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="internal-note" className="text-sm dark:text-gray-300">
                      Internal note only
                    </label>
                  </div>
                </div>
                
                <textarea
                  placeholder="Type your response..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 min-h-[100px] bg-violet-500/10 dark:text-white gaming-input"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-1" />
                      Attach File
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setReplyMessage('')}>
                      Cancel
                    </Button>
                    <Button onClick={() => sendReply(selectedTicket.id, replyMessage)}>
                      <Send className="h-4 w-4 mr-1" />
                      Send Reply
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

      {/* Bulk Notification Modal */}
      <BulkNotificationModal
        isOpen={isBulkNotificationOpen}
        onClose={() => setIsBulkNotificationOpen(false)}
        onSend={handleSendBulkNotification}
      />
    </>
  )
}