import {
  supabase,
  type Budget,
  type Category,
  type Transaction,
} from './supabase'
import { normalizeUserId } from './user-utils'

// Categories API
export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(
    category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) throw error
  },

  async initializeDefaultCategories(userId: string): Promise<void> {
    // ユーザーIDを正規化（Google OAuth IDをUUIDに変換）
    const normalizedUserId = normalizeUserId(userId)
    console.log(
      'Starting category initialization for user:',
      userId,
      '-> normalized:',
      normalizedUserId
    )

    const defaultCategories = [
      // Income categories
      {
        name: '給与',
        color: '#10b981',
        icon: 'briefcase',
        type: 'income' as const,
        user_id: normalizedUserId,
      },
      {
        name: 'ボーナス',
        color: '#059669',
        icon: 'gift',
        type: 'income' as const,
        user_id: normalizedUserId,
      },
      {
        name: '副業',
        color: '#06b6d4',
        icon: 'laptop',
        type: 'income' as const,
        user_id: normalizedUserId,
      },
      {
        name: '投資・配当',
        color: '#8b5cf6',
        icon: 'trending-up',
        type: 'income' as const,
        user_id: normalizedUserId,
      },
      {
        name: '年金',
        color: '#22c55e',
        icon: 'user-check',
        type: 'income' as const,
        user_id: normalizedUserId,
      },
      {
        name: 'お小遣い',
        color: '#f59e0b',
        icon: 'coins',
        type: 'income' as const,
        user_id: normalizedUserId,
      },
      {
        name: 'その他収入',
        color: '#6b7280',
        icon: 'plus-circle',
        type: 'income' as const,
        user_id: normalizedUserId,
      },

      // Expense categories
      {
        name: '食費',
        color: '#ef4444',
        icon: 'utensils',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '外食',
        color: '#dc2626',
        icon: 'coffee',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '交通費',
        color: '#f59e0b',
        icon: 'car',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '光熱費',
        color: '#eab308',
        icon: 'zap',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '家賃・住居費',
        color: '#84cc16',
        icon: 'home',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '通信費',
        color: '#06b6d4',
        icon: 'smartphone',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '娯楽',
        color: '#ec4899',
        icon: 'music',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '服・美容',
        color: '#f97316',
        icon: 'shirt',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '医療費',
        color: '#14b8a6',
        icon: 'heart',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '教育',
        color: '#3b82f6',
        icon: 'book',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '保険',
        color: '#059669',
        icon: 'shield',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '税金',
        color: '#7c3aed',
        icon: 'file-text',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '貯金・投資',
        color: '#9333ea',
        icon: 'piggy-bank',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: '日用品',
        color: '#64748b',
        icon: 'shopping-cart',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
      {
        name: 'その他支出',
        color: '#6b7280',
        icon: 'minus-circle',
        type: 'expense' as const,
        user_id: normalizedUserId,
      },
    ]

    // Check existing categories to avoid duplicates
    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', normalizedUserId)

    if (fetchError) throw fetchError

    const existingNames = new Set(
      existingCategories?.map((cat: { name: string }) => cat.name) || []
    )

    // Filter out categories that already exist
    const categoriesToAdd = defaultCategories.filter(
      cat => !existingNames.has(cat.name)
    )

    if (categoriesToAdd.length > 0) {
      const { error } = await supabase
        .from('categories')
        .insert(categoriesToAdd)

      if (error) throw error
    }
  },
}

// Transactions API
export const transactionsApi = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        *,
        categories (*)
      `
      )
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    // Get the last day of the month correctly
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        *,
        categories (*)
      `
      )
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(
    transaction: Omit<
      Transaction,
      'id' | 'created_at' | 'updated_at' | 'categories' | 'user_id'
    >
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select(
        `
        *,
        categories (*)
      `
      )
      .single()

    if (error) throw error
    return data
  },

  async update(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        categories (*)
      `
      )
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) throw error
  },
}

// Budgets API
export const budgetsApi = {
  async getByMonth(year: number, month: number): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(
        `
        *,
        categories (*)
      `
      )
      .eq('year', year)
      .eq('month', month)
      .order('categories(name)', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(
    budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'categories'>
  ): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select(
        `
        *,
        categories (*)
      `
      )
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        categories (*)
      `
      )
      .single()

    if (error) throw error
    return data
  },

  async upsert(
    budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'categories'>
  ): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(budget, { onConflict: 'category_id,month,year' })
      .select(
        `
        *,
        categories (*)
      `
      )
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('budgets').delete().eq('id', id)

    if (error) throw error
  },
}

// Monthly Summary API
export const summaryApi = {
  async getMonthlyData(year: number, month: number) {
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('type', { ascending: true })
      .order('category_name', { ascending: true })

    if (error) throw error
    return data || []
  },
}
