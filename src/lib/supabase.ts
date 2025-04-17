
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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