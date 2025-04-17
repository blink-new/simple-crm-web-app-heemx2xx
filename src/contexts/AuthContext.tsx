
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isEmailConfirmed: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsEmailConfirmed(session?.user?.email_confirmed_at != null)
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsEmailConfirmed(session?.user?.email_confirmed_at != null)
      
      if (!session?.user) {
        navigate('/login', { replace: true })
      } else if (location.pathname === '/login' || location.pathname === '/register') {
        navigate('/dashboard', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, location])

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email before signing in')
          setIsEmailConfirmed(false)
        } else {
          throw error
        }
      }
      
      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        toast.warning('Please confirm your email to access all features')
        setIsEmailConfirmed(false)
      } else {
        setIsEmailConfirmed(true)
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      })
      
      if (error) throw error
      
      // If autoconfirm is disabled, show message
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Registration successful! Please check your email to confirm your account.')
        setIsEmailConfirmed(false)
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isEmailConfirmed }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}