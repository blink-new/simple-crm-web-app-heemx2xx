
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

const supabaseUrl = 'https://iuipvfffsxxtrteectim.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aXB2ZmZmc3h4dHJ0ZWVjdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzU1MTcsImV4cCI6MjA2MDQxMTUxN30.b2n10AbhMm-12H9t72VFJCg_MtLDglwj2WhUBPnkyv4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
})

// Types for our CRM data
export type Contact = {
  id: string
  user_id: string
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

// Error handling utility
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Database interface with error handling
export const db = {
  contacts: {
    async list() {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw new DatabaseError('Failed to fetch contacts', error)
        return data as Contact[]
      } catch (error) {
        console.error('Error fetching contacts:', error)
        throw new DatabaseError('Failed to fetch contacts', error)
      }
    },

    async getById(id: string) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw new DatabaseError('Failed to fetch contact', error)
        return data as Contact
      } catch (error) {
        console.error('Error fetching contact:', error)
        throw new DatabaseError('Failed to fetch contact', error)
      }
    },

    async create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new DatabaseError('User not authenticated')
        
        const { data, error } = await supabase
          .from('contacts')
          .insert([{ ...contact, user_id: userData.user.id }])
          .select()
        
        if (error) throw new DatabaseError('Failed to create contact', error)
        return data[0] as Contact
      } catch (error) {
        console.error('Error creating contact:', error)
        throw new DatabaseError('Failed to create contact', error)
      }
    },

    async update(id: string, contact: Partial<Contact>) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .update({ ...contact, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
        
        if (error) throw new DatabaseError('Failed to update contact', error)
        return data[0] as Contact
      } catch (error) {
        console.error('Error updating contact:', error)
        throw new DatabaseError('Failed to update contact', error)
      }
    },

    async delete(id: string) {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id)
        
        if (error) throw new DatabaseError('Failed to delete contact', error)
      } catch (error) {
        console.error('Error deleting contact:', error)
        throw new DatabaseError('Failed to delete contact', error)
      }
    },

    async search(query: string) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
          .order('created_at', { ascending: false })
        
        if (error) throw new DatabaseError('Failed to search contacts', error)
        return data as Contact[]
      } catch (error) {
        console.error('Error searching contacts:', error)
        throw new DatabaseError('Failed to search contacts', error)
      }
    }
  },

  activities: {
    async listByContact(contactId: string) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
        
        if (error) throw new DatabaseError('Failed to fetch activities', error)
        return data as Activity[]
      } catch (error) {
        console.error('Error fetching activities:', error)
        throw new DatabaseError('Failed to fetch activities', error)
      }
    },

    async create(activity: Omit<Activity, 'id' | 'created_at'>) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new DatabaseError('User not authenticated')
        
        const { data, error } = await supabase
          .from('activities')
          .insert([{ ...activity, user_id: userData.user.id }])
          .select()
        
        if (error) throw new DatabaseError('Failed to create activity', error)
        return data[0] as Activity
      } catch (error) {
        console.error('Error creating activity:', error)
        throw new DatabaseError('Failed to create activity', error)
      }
    }
  },

  tags: {
    async list() {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name')
        
        if (error) throw new DatabaseError('Failed to fetch tags', error)
        return data as Tag[]
      } catch (error) {
        console.error('Error fetching tags:', error)
        throw new DatabaseError('Failed to fetch tags', error)
      }
    },

    async create(tag: Omit<Tag, 'id' | 'created_at'>) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new DatabaseError('User not authenticated')
        
        const { data, error } = await supabase
          .from('tags')
          .insert([{ ...tag, user_id: userData.user.id }])
          .select()
        
        if (error) throw new DatabaseError('Failed to create tag', error)
        return data[0] as Tag
      } catch (error) {
        console.error('Error creating tag:', error)
        throw new DatabaseError('Failed to create tag', error)
      }
    }
  }
}