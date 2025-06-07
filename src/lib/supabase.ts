import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Helper function to create authenticated Supabase client with user session
export const createAuthenticatedSupabaseClient = (userSession: {
  user?: { id: string }
  access_token?: string
}) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${userSession?.access_token || ''}`,
      },
    },
  })
}

// Legacy database types (これらはDrizzleに移行予定)
export interface Category {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
  color: string
  icon: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  description?: string
  transaction_date: string
  user_id: string
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Budget {
  id: string
  category_id: string
  amount: number
  month: number
  year: number
  user_id: string
  created_at: string
  updated_at: string
  categories?: Category
}

export interface MonthlySummary {
  year: number
  month: number
  type: 'income' | 'expense'
  category_name: string
  category_color: string
  category_icon: string
  total_amount: number
  transaction_count: number
}
