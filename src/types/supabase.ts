
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          company: string | null
          status: 'Lead' | 'Prospect' | 'Customer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          status?: 'Lead' | 'Prospect' | 'Customer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          status?: 'Lead' | 'Prospect' | 'Customer'
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          contact_id: string
          user_id: string
          type: 'Call' | 'Meeting' | 'Email' | 'Note'
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          user_id: string
          type: 'Call' | 'Meeting' | 'Email' | 'Note'
          description: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          user_id?: string
          type?: 'Call' | 'Meeting' | 'Email' | 'Note'
          description?: string
          date?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
        }
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
      }
    }
  }
}