import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from './db'
import { budgets, categories, transactions } from './db/schema'

import type { Budget, Category, Transaction } from './db/schema'

// Categories API
export const categoriesApi = {
  // Get all categories for a user
  async getByUserId(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
  },

  // Create a new category
  async create(
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning()
    return category
  },

  // Update a category
  async update(
    id: string,
    data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning()
    return category
  },

  // Delete a category
  async delete(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id))
  },
}

// Transactions API
export const transactionsApi = {
  // Get all transactions for a user
  async getByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate))
  },

  // Get transactions for a specific month/year
  async getByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<Transaction[]> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.transactionDate} >= ${startDate}`,
          sql`${transactions.transactionDate} <= ${endDate}`
        )
      )
      .orderBy(desc(transactions.transactionDate))
  },

  // Create a new transaction
  async create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(data).returning()
    return transaction
  },

  // Update a transaction
  async update(
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning()
    return transaction
  },

  // Delete a transaction
  async delete(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id))
  },

  // Get monthly summary with category information
  async getMonthlySummary(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    return await db
      .select({
        year: sql<number>`${year}`,
        month: sql<number>`${month}`,
        type: transactions.type,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
        totalAmount: sql<number>`sum(${transactions.amount}::numeric)`,
        transactionCount: sql<number>`count(*)`,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.transactionDate} >= ${startDate}`,
          sql`${transactions.transactionDate} <= ${endDate}`
        )
      )
      .groupBy(
        transactions.type,
        categories.name,
        categories.color,
        categories.icon
      )
  },
}

// Budgets API
export const budgetsApi = {
  // Get all budgets for a user
  async getByUserId(userId: string): Promise<Budget[]> {
    return await db.select().from(budgets).where(eq(budgets.userId, userId))
  },

  // Get budgets for a specific month/year
  async getByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.year, year),
          eq(budgets.month, month)
        )
      )
  },

  // Create a new budget
  async create(
    data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(data).returning()
    return budget
  },

  // Update a budget
  async update(
    id: string,
    data: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Budget> {
    const [budget] = await db
      .update(budgets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgets.id, id))
      .returning()
    return budget
  },

  // Delete a budget
  async delete(id: string): Promise<void> {
    await db.delete(budgets).where(eq(budgets.id, id))
  },
}
