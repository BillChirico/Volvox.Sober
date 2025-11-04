/**
 * Supabase client configuration
 * Provides typed Supabase client for the application
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// Environment variables (to be configured)
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.')
}

/**
 * Typed Supabase client
 * Provides type-safe access to database tables and functions
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Get current user ID
 */
export const getCurrentUserId = async () => {
  const user = await getCurrentUser()
  return user?.id
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}
