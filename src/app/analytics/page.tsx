'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  AreaChart,
  BarChart3,
  Calendar,
  LineChart,
  PieChart,
  TrendingUp,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

import AdvancedChart from '@/components/AdvancedChart'
import CategoryChart from '@/components/CategoryChart'
import MonthSelector from '@/components/MonthSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { categoriesApi, transactionsApi } from '@/lib/api'
import { Category, Transaction } from '@/lib/supabase'
import { getCurrentMonth } from '@/lib/utils'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chart view state
  const [chartView, setChartView] = useState<'line' | 'bar' | 'pie' | 'area'>(
    'line'
  )

  // Time range state
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>(
    'month'
  )
  const [selectedDate, setSelectedDate] = useState(getCurrentMonth())

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
      let data: Transaction[] = []

      switch (timeRange) {
        case 'month':
          data = await transactionsApi.getByMonth(
            selectedDate.year,
            selectedDate.month,
            session.user.id
          )
          break
        case 'quarter':
          // 四半期のデータ取得ロジック
          const quarterStartMonth =
            Math.floor((selectedDate.month - 1) / 3) * 3 + 1
          for (let i = 0; i < 3; i++) {
            const monthData = await transactionsApi.getByMonth(
              selectedDate.year,
              quarterStartMonth + i,
              session.user.id
            )
            data = [...data, ...monthData]
          }
          break
        case 'year':
          // 年間のデータ取得ロジック
          for (let month = 1; month <= 12; month++) {
            const monthData = await transactionsApi.getByMonth(
              selectedDate.year,
              month,
              session.user.id
            )
            data = [...data, ...monthData]
          }
          break
      }

      setTransactions(data)
    } catch (err) {
      setError('取引データの読み込みに失敗しました')
      console.error('Error loading transactions:', err)
    }
  }, [selectedDate, timeRange, session?.user?.id])

  // Load initial data
  useEffect(() => {
    if (session?.user) {
      loadInitialData()
    }
  }, [session?.user])

  // Load transactions when parameters change
  useEffect(() => {
    if (categories.length > 0 && session?.user) {
      loadTransactions()
    }
  }, [categories, session?.user, loadTransactions])

  const calculateTrends = () => {
    const incomeByCategory = new Map<string, number>()
    const expenseByCategory = new Map<string, number>()

    transactions.forEach(transaction => {
      const categoryName = transaction.categories?.name || 'その他'
      if (transaction.type === 'income') {
        incomeByCategory.set(
          categoryName,
          (incomeByCategory.get(categoryName) || 0) + transaction.amount
        )
      } else {
        expenseByCategory.set(
          categoryName,
          (expenseByCategory.get(categoryName) || 0) + transaction.amount
        )
      }
    })

    const topIncomeCategories = Array.from(incomeByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const topExpenseCategories = Array.from(expenseByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return { topIncomeCategories, topExpenseCategories }
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

  const { topIncomeCategories, topExpenseCategories } = calculateTrends()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">アナリティクス</h1>
          <p className="text-muted">詳細な財務分析とトレンド</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-1">
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
                className={
                  timeRange === 'month' ? 'btn-primary' : 'btn-secondary'
                }
              >
                月
              </Button>
              <Button
                variant={timeRange === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('quarter')}
                className={
                  timeRange === 'quarter' ? 'btn-primary' : 'btn-secondary'
                }
              >
                四半期
              </Button>
              <Button
                variant={timeRange === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('year')}
                className={
                  timeRange === 'year' ? 'btn-primary' : 'btn-secondary'
                }
              >
                年
              </Button>
            </div>
          </div>

          {/* Date Selector */}
          <MonthSelector
            year={selectedDate.year}
            month={selectedDate.month}
            onMonthChange={(year, month) => setSelectedDate({ year, month })}
          />
        </div>
      </div>

      {/* Chart Controls */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>詳細分析グラフ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={chartView === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartView('line')}
              className={chartView === 'line' ? 'btn-primary' : 'btn-secondary'}
            >
              <LineChart className="h-4 w-4 mr-2" />
              ライングラフ
            </Button>
            <Button
              variant={chartView === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartView('bar')}
              className={chartView === 'bar' ? 'btn-primary' : 'btn-secondary'}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              バーグラフ
            </Button>
            <Button
              variant={chartView === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartView('pie')}
              className={chartView === 'pie' ? 'btn-primary' : 'btn-secondary'}
            >
              <PieChart className="h-4 w-4 mr-2" />
              パイグラフ
            </Button>
            <Button
              variant={chartView === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartView('area')}
              className={chartView === 'area' ? 'btn-primary' : 'btn-secondary'}
            >
              <AreaChart className="h-4 w-4 mr-2" />
              エリアグラフ
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdvancedChart
              transactions={transactions}
              type={chartView}
              title="日別収支推移"
              dataType="daily"
            />
            <AdvancedChart
              transactions={transactions}
              type={chartView === 'line' ? 'bar' : chartView}
              title="カテゴリ別分析"
              dataType="category"
            />
          </div>
        </CardContent>
      </Card>

      {/* Traditional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryChart transactions={transactions} type="expense" />
        <CategoryChart transactions={transactions} type="income" />
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Income Categories */}
        <Card className="card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>収入トップカテゴリ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topIncomeCategories.length > 0 ? (
                topIncomeCategories.map(([category, amount], index) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{category}</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      ¥{amount.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">
                  データがありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Expense Categories */}
        <Card className="card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <span>支出トップカテゴリ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topExpenseCategories.length > 0 ? (
                topExpenseCategories.map(([category, amount], index) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{category}</span>
                    </div>
                    <span className="text-red-600 font-bold">
                      ¥{amount.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">
                  データがありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card className="card">
        <CardHeader>
          <CardTitle>期間サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {transactions.filter(t => t.type === 'income').length}
              </div>
              <p className="text-sm text-muted">収入取引数</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {transactions.filter(t => t.type === 'expense').length}
              </div>
              <p className="text-sm text-muted">支出取引数</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                ¥
                {(
                  transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) /
                  (transactions.filter(t => t.type === 'income').length || 1)
                ).toLocaleString()}
              </div>
              <p className="text-sm text-muted">平均収入額</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                ¥
                {(
                  transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0) /
                  (transactions.filter(t => t.type === 'expense').length || 1)
                ).toLocaleString()}
              </div>
              <p className="text-sm text-muted">平均支出額</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
