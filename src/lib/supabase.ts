
import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Type definitions
export type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company: string | null
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  notes: string | null
  created_at: string
  updated_at: string
}

export type Activity = {
  id: string
  contact_id: string
  type: string
  description: string
  created_at: string
}

export type Tag = {
  id: string
  name: string
  color: string
}

// Helper to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('contacts').select('id').limit(1)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Supabase connection error:', error)
    return false
  }
}