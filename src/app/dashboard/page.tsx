'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { BarChart3, FolderPlus, Plus, TrendingUp, Wallet } from 'lucide-react'
import { useSession } from 'next-auth/react'

import MonthlySummary from '@/components/MonthlySummary'
import MonthSelector from '@/components/MonthSelector'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { categoriesApi, transactionsApi } from '@/lib/api'
import { Category, Transaction } from '@/lib/supabase'
import { getCurrentMonth } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >()

  // Date state
  const [selectedDate, setSelectedDate] = useState(getCurrentMonth())

  // Welcome message state
  const [showWelcome, setShowWelcome] = useState(false)
  const [isInitializingCategories, setIsInitializingCategories] =
    useState(false)

  // Check authentication status
  useEffect(() => {
    if (status === 'loading') return // まだ読み込み中

    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])

  // Load initial data
  const loadInitialData = async () => {
    if (!session?.user?.id) {
      setError('ユーザー認証が必要です')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [categoriesData] = await Promise.all([
        categoriesApi.getAll(session.user.id),
      ])
      setCategories(categoriesData)

      // Show welcome message if no categories exist
      if (categoriesData.length === 0) {
        setShowWelcome(true)
      }
    } catch (err) {
      setError('データの読み込みに失敗しました')
      console.error('Error loading initial data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = useCallback(async () => {
    if (!session?.user?.id) {
      setError('ユーザー認証が必要です')
      return
    }

    try {
      const data = await transactionsApi.getByMonth(
        selectedDate.year,
        selectedDate.month,
        session.user.id
      )
      setTransactions(data)
    } catch (err) {
      setError('記録データの読み込みに失敗しました')
      console.error('Error loading transactions:', err)
    }
  }, [selectedDate, session?.user?.id])

  useEffect(() => {
    if (session?.user) {
      loadInitialData()
    }
  }, [session?.user])

  // Load transactions when date changes
  useEffect(() => {
    if (categories.length > 0 && session?.user) {
      loadTransactions()
    }
  }, [categories, session?.user, loadTransactions])

  const handleAddTransaction = async (
    transactionData: Omit<
      Transaction,
      'id' | 'created_at' | 'updated_at' | 'categories' | 'user_id'
    >
  ) => {
    if (!session?.user?.id) {
      setError('ユーザー認証が必要です')
      return
    }

    try {
      await transactionsApi.create(transactionData, session.user.id)
      await loadTransactions()
    } catch (err) {
      setError('記録の追加に失敗しました')
      console.error('Error adding transaction:', err)
    }
  }

  const handleEditTransaction = async (
    transactionData: Omit<
      Transaction,
      'id' | 'created_at' | 'updated_at' | 'categories' | 'user_id'
    >
  ) => {
    if (!editingTransaction) return

    try {
      await transactionsApi.update(editingTransaction.id, transactionData)
      await loadTransactions()
      setEditingTransaction(undefined)
    } catch (err) {
      setError('記録の更新に失敗しました')
      console.error('Error updating transaction:', err)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('この記録を削除しますか？')) return

    try {
      await transactionsApi.delete(id)
      await loadTransactions()
    } catch (err) {
      setError('記録の削除に失敗しました')
      console.error('Error deleting transaction:', err)
    }
  }

  const handleFormSubmit = (
    data: Omit<
      Transaction,
      'id' | 'created_at' | 'updated_at' | 'categories' | 'user_id'
    >
  ) => {
    if (editingTransaction) {
      handleEditTransaction(data)
    } else {
      handleAddTransaction(data)
    }
  }

  const openEditForm = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTransaction(undefined)
  }

  const handleInitializeCategories = async () => {
    if (!session?.user?.id) {
      console.error('User ID not available in session')
      setError('ユーザー情報が取得できません')
      return
    }

    try {
      setIsInitializingCategories(true)
      console.log('Initializing categories for user:', session.user.id)
      await categoriesApi.initializeDefaultCategories(session.user.id)
      console.log('Categories initialized successfully')
      await loadInitialData() // Reload categories
      setShowWelcome(false)
    } catch (error) {
      console.error('Error initializing categories:', error)
      // より詳細なエラー情報を表示
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        setError(`カテゴリの初期化に失敗しました: ${error.message}`)
      } else {
        console.error('Unknown error:', error)
        setError('カテゴリの初期化に失敗しました（不明なエラー）')
      }
    } finally {
      setIsInitializingCategories(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null // リダイレクト中
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="card max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">エラーが発生しました</h2>
            <p className="text-muted mb-4">{error}</p>
            <Button onClick={loadInitialData} className="btn-primary">
              再試行
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message for New Users */}
      {showWelcome && (
        <Card className="card border-primary bg-primary/5">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  家計簿アプリへようこそ！
                </h2>
                <p className="text-muted mb-4">
                  まずはカテゴリを設定して、収支の記録を始めましょう。
                </p>
                <Button
                  onClick={handleInitializeCategories}
                  disabled={isInitializingCategories}
                  className="btn-primary"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  {isInitializingCategories
                    ? '設定中...'
                    : 'カテゴリを自動設定'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <p className="text-muted">財務状況の概要を確認</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/analytics">
            <Button variant="outline" className="btn-secondary">
              <BarChart3 className="h-4 w-4 mr-2" />
              詳細分析
            </Button>
          </Link>
          <Button onClick={() => setIsFormOpen(true)} className="btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            記録を追加
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="animate-slide-in">
        <MonthSelector
          year={selectedDate.year}
          month={selectedDate.month}
          onMonthChange={(year, month) => setSelectedDate({ year, month })}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の収入</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ¥
              {transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              前月比較データを表示予定
            </p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の支出</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ¥
              {transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              前月比較データを表示予定
            </p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">純収支</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥
              {(
                transactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0) -
                transactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              前月比較データを表示予定
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="animate-fade-in">
        <MonthlySummary
          transactions={transactions}
          year={selectedDate.year}
          month={selectedDate.month}
        />
      </div>

      {/* Recent Transactions */}
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <TrendingUp className="h-6 w-6" />
            <span>最近の記録</span>
          </h2>
          <Link href="/transactions">
            <Button variant="outline" className="btn-secondary">
              すべて表示
            </Button>
          </Link>
        </div>

        <TransactionList
          transactions={transactions.slice(0, 10)}
          onEdit={openEditForm}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        categories={categories}
        transaction={editingTransaction}
      />
    </div>
  )
}
