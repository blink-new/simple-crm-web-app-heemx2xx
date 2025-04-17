
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client with fallback for development
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',  // Fallback for development
  supabaseAnonKey || 'placeholder-key',     // Fallback for development
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
  }
)

// Type definitions for our CRM data
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

// Database interface
export const db = {
  contacts: {
    async list() {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Contact[]
    },
    async create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
      if (error) throw error
      return data[0] as Contact
    },
    async update(id: string, contact: Partial<Contact>) {
      const { data, error } = await supabase
        .from('contacts')
        .update(contact)
        .eq('id', id)
        .select()
      if (error) throw error
      return data[0] as Contact
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  },
  activities: {
    async listByContact(contactId: string) {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Activity[]
    },
    async create(activity: Omit<Activity, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .select()
      if (error) throw error
      return data[0] as Activity
    },
  },
  tags: {
    async list() {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Tag[]
    },
    async create(tag: Omit<Tag, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('tags')
        .insert([tag])
        .select()
      if (error) throw error
      return data[0] as Tag
    },
  },
}