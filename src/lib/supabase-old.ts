import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase'

// Environment variables for Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get authenticated Supabase client
export const getAuthenticatedClient = () => {
  const { data: { session } } = supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No authenticated session found')
  }
  
  return supabase
}

// Helper function to check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id, role')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return data?.role === 'admin' || data?.role === 'super_admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Helper function to get admin permissions
export const getAdminPermissions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role, permissions')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching admin permissions:', error)
      return { role: 'user', permissions: [] }
    }

    return {
      role: data?.role || 'user',
      permissions: data?.permissions || []
    }
  } catch (error) {
    console.error('Error fetching admin permissions:', error)
    return { role: 'user', permissions: [] }
  }
}

// Export the client for use in other modules
export default supabase
