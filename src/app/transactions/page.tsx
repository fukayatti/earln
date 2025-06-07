'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Download, Filter, Plus, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

import MonthSelector from '@/components/MonthSelector'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { categoriesApi, transactionsApi } from '@/lib/api'
import { Category, Transaction } from '@/lib/supabase'
import { getCurrentMonth } from '@/lib/utils'

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >()

  // Filter state
  const [selectedDate, setSelectedDate] = useState(getCurrentMonth())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<
    'all' | 'income' | 'expense'
  >('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
  useEffect(() => {
    if (session?.user) {
      loadInitialData()
    }
  }, [session?.user])

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

  const applyFilters = useCallback(() => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        transaction =>
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.categories?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        transaction => transaction.category_id === selectedCategory
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        transaction => transaction.type === selectedType
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'date':
          compareValue =
            new Date(a.transaction_date).getTime() -
            new Date(b.transaction_date).getTime()
          break
        case 'amount':
          compareValue = a.amount - b.amount
          break
        case 'category':
          compareValue = (a.categories?.name || '').localeCompare(
            b.categories?.name || ''
          )
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    setFilteredTransactions(filtered)
  }, [
    transactions,
    searchTerm,
    selectedCategory,
    selectedType,
    sortBy,
    sortOrder,
  ])

  // Load transactions when date changes
  useEffect(() => {
    if (categories.length > 0 && session?.user) {
      loadTransactions()
    }
  }, [categories, session?.user, loadTransactions])

  // Apply filters when transactions or filter criteria change
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

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

  const exportToCSV = () => {
    const csvContent = [
      ['日付', 'タイプ', 'カテゴリ', '金額', '説明'],
      ...filteredTransactions.map(t => [
        t.transaction_date,
        t.type === 'income' ? '収入' : '支出',
        t.categories?.name || '',
        t.amount.toString(),
        t.description || '',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `transactions_${selectedDate.year}_${selectedDate.month}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">家計簿</h1>
          <p className="text-muted">収支の記録を管理・検索</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
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

      {/* Filters */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>フィルタ・検索</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="説明やカテゴリで検索..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">すべてのカテゴリ</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            {/* Type Filter */}
            <Select
              value={selectedType}
              onChange={e =>
                setSelectedType(e.target.value as 'all' | 'income' | 'expense')
              }
            >
              <option value="all">すべてのタイプ</option>
              <option value="income">収入</option>
              <option value="expense">支出</option>
            </Select>

            {/* Sort By */}
            <Select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'date' | 'amount' | 'category')
              }
            >
              <option value="date">日付順</option>
              <option value="amount">金額順</option>
              <option value="category">カテゴリ順</option>
            </Select>

            {/* Sort Order */}
            <Select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </Select>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>
              {filteredTransactions.length} 件の記録が見つかりました
              {transactions.length !== filteredTransactions.length &&
                ` (全 ${transactions.length} 件中)`}
            </span>
            {(searchTerm ||
              selectedCategory !== 'all' ||
              selectedType !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedType('all')
                }}
                className="btn-secondary"
              >
                フィルタをクリア
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ¥
                {filteredTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted">今月の収入</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ¥
                {filteredTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted">今月の支出</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ¥
                {(
                  filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) -
                  filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                ).toLocaleString()}
              </div>
              <p className="text-sm text-muted">今月の収支</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-6 animate-fade-in">
        <TransactionList
          transactions={filteredTransactions}
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
