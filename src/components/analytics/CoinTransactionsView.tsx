import React, { useEffect, useState } from 'react'
import { Search, Download, Filter, Coins, ArrowUpDown, Calendar, User, Hash, DollarSign, TrendingUp, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { DateRangePicker } from '../ui/DateRangePicker'
import { getSupabaseClient } from '../../lib/supabase'
import { format, subDays } from 'date-fns'
import { formatNumber, formatCurrency } from '../../lib/utils'

interface CoinTransaction {
  id: string
  transaction_id: string
  user_id: string
  user_email: string
  transaction_type: 'refund' | 'coin_purchase' | 'video_promotion' | 'bonus' | 'adjustment' | 'referral_reward'
  amount: number
  description?: string
  admin_id?: string
  created_at: string
  updated_at: string
}

interface TransactionStats {
  totalTransactions: number
  totalVolume: number
  refunds: number
  purchases: number
  promotions: number
  bonuses: number
}

export function CoinTransactionsView() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 30),
    new Date()
  ])
  const [sortField, setSortField] = useState<'created_at' | 'amount'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchTransactions()
  }, [dateRange, typeFilter])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      const startDate = dateRange[0] || subDays(new Date(), 30)
      const endDate = dateRange[1] || new Date()

      // Build query
      let query = supabase
        .from('transactions')
        .select(`
          id,
          transaction_id,
          user_id,
          transaction_type,
          amount,
          description,
          admin_id,
          created_at,
          updated_at,
          profiles!inner(email)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order(sortField, { ascending: sortDirection === 'asc' })

      // Apply type filter
      if (typeFilter !== 'all') {
        query = query.eq('transaction_type', typeFilter)
      }

      const { data: transactionData, error } = await query.limit(1000)

      if (error) throw error

      // Transform data to include user email
      const transformedTransactions: CoinTransaction[] = transactionData?.map(tx => ({
        id: tx.id,
        transaction_id: tx.transaction_id || tx.id,
        user_id: tx.user_id,
        user_email: tx.profiles?.email || 'Unknown',
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        description: tx.description,
        admin_id: tx.admin_id,
        created_at: tx.created_at,
        updated_at: tx.updated_at
      })) || []

      setTransactions(transformedTransactions)

      // Calculate stats
      const totalTransactions = transformedTransactions.length
      const totalVolume = transformedTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
      const refunds = transformedTransactions.filter(tx => tx.transaction_type === 'refund').length
      const purchases = transformedTransactions.filter(tx => tx.transaction_type === 'coin_purchase').length
      const promotions = transformedTransactions.filter(tx => tx.transaction_type === 'video_promotion').length
      const bonuses = transformedTransactions.filter(tx => tx.transaction_type === 'bonus').length

      setStats({
        totalTransactions,
        totalVolume,
        refunds,
        purchases,
        promotions,
        bonuses
      })

    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions([])
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleSort = (field: 'created_at' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'refund':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'coin_purchase':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
      case 'video_promotion':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'bonus':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
      case 'adjustment':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      case 'referral_reward':
        return 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    const colorClass = getTransactionTypeColor(type)
    const label = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    )
  }

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'User Email', 'Transaction ID', 'Type', 'Amount', 'Description'].join(','),
      ...filteredTransactions.map(tx => [
        format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
        tx.user_email,
        tx.transaction_id,
        tx.transaction_type,
        tx.amount,
        tx.description || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coin-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
            Coin Transactions
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Detailed view of all coin-related transactions
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button 
            onClick={fetchTransactions}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={exportTransactions}
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-stagger-children">
        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Hash className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-violet-600 dark:text-violet-400 gaming-text-shadow">
              {formatNumber(stats?.totalTransactions || 0)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 gaming-text-shadow">
              {formatNumber(stats?.totalVolume || 0)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 gaming-text-shadow">
              {formatNumber(stats?.purchases || 0)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Purchases</div>
          </CardContent>
        </Card>

        <Card className="gaming-card-enhanced">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 gaming-glow">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 gaming-text-shadow">
              {formatNumber(stats?.promotions || 0)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Promotions</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="gaming-card-enhanced">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-violet-500/30 rounded-lg bg-violet-500/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 gaming-input min-w-[140px]"
            >
              <option value="all">All Types</option>
              <option value="refund">Refunds</option>
              <option value="coin_purchase">Purchases</option>
              <option value="video_promotion">Promotions</option>
              <option value="bonus">Bonuses</option>
              <option value="adjustment">Adjustments</option>
              <option value="referral_reward">Referral Rewards</option>
            </select>

            {/* Date Range */}
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="gaming-card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span>Transaction History</span>
              <Badge variant="default" className="text-xs">
                {filteredTransactions.length} results
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="divide-y divide-violet-500/20">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-violet-500/5 transition-colors">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-medium text-sm gaming-glow flex-shrink-0">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {transaction.user_email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {transaction.transaction_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getTransactionTypeBadge(transaction.transaction_type)}
                      <div className={`text-sm font-bold ${
                        transaction.amount >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatNumber(transaction.amount)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    {transaction.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded p-2">
                        {transaction.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      {transaction.admin_id && (
                        <span className="text-violet-600 dark:text-violet-400">Admin Action</span>
                      )}
                    </div>
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
                      <span>User Email</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4" />
                      <span>Transaction ID</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <span>Type</span>
                    </div>
                  </th>
                  <th 
                    className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm cursor-pointer hover:bg-violet-500/10 transition-colors"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4" />
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm cursor-pointer hover:bg-violet-500/10 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date/Time</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-violet-500/10 hover:bg-violet-500/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-medium text-xs gaming-glow flex-shrink-0">
                          {transaction.user_email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {transaction.user_email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded font-mono text-violet-600 dark:text-violet-400">
                        {transaction.transaction_id}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      {getTransactionTypeBadge(transaction.transaction_type)}
                    </td>
                    <td className="py-4 px-6">
                      <div className={`text-sm font-bold ${
                        transaction.amount >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatNumber(transaction.amount)} coins
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(transaction.created_at), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {transaction.description || 'No description'}
                        </p>
                        {transaction.admin_id && (
                          <Badge variant="info" className="text-xs mt-1">
                            Admin Action
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-orange-500 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Transactions Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Coin transactions will appear here when users make purchases or spend coins'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}