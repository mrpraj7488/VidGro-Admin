import { useState, useEffect } from 'react'
import { getSupabaseAdminClient } from '../lib/supabase'

export function useInboxCount() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCount = async () => {
    try {
      const supabase = getSupabaseAdminClient()
      if (!supabase) {
        setCount(0)
        return
      }

      // Count only tickets with 'active' status
      const { count: ticketCount, error } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (error) {
        // Failed to fetch inbox count
        setCount(0)
        return
      }

      setCount(ticketCount || 0)
    } catch (error) {
      // Failed to fetch inbox count
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCount()

    // Set up real-time subscription for count updates
    const supabase = getSupabaseAdminClient()
    if (!supabase) return

    const subscription = supabase
      .channel('inbox_count_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_tickets' 
        },
        () => {
          // Refetch count when tickets change
          fetchCount()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { count, isLoading, refetch: fetchCount }
}
