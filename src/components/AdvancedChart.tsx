'use client'

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/supabase'

interface AdvancedChartProps {
  transactions: Transaction[]
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  dataType: 'daily' | 'category' | 'trend'
}

const COLORS = [
  '#2563eb',
  '#7c3aed',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#c2410c',
  '#9333ea',
  '#be123c',
]

export default function AdvancedChart({
  transactions,
  type,
  title,
  dataType,
}: AdvancedChartProps) {
  const prepareData = () => {
    if (dataType === 'daily') {
      // 日別データの準備
      const dailyData = new Map<string, { income: number; expense: number }>()

      // 現在の月の全日を初期化
      const now = new Date()
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)
      const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
      })

      daysInMonth.forEach(day => {
        const key = format(day, 'yyyy-MM-dd')
        dailyData.set(key, { income: 0, expense: 0 })
      })

      // トランザクションデータを集計
      transactions.forEach(transaction => {
        const date = format(
          parseISO(transaction.transaction_date),
          'yyyy-MM-dd'
        )
        const existing = dailyData.get(date) || { income: 0, expense: 0 }

        if (transaction.type === 'income') {
          existing.income += transaction.amount
        } else {
          existing.expense += transaction.amount
        }

        dailyData.set(date, existing)
      })

      return Array.from(dailyData.entries())
        .map(([date, data]) => ({
          date: format(parseISO(date), 'M/d', { locale: ja }),
          収入: data.income,
          支出: data.expense,
          純収支: data.income - data.expense,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }

    if (dataType === 'category') {
      // カテゴリ別データの準備
      const categoryData = new Map<
        string,
        { income: number; expense: number }
      >()

      transactions.forEach(transaction => {
        const categoryName = transaction.categories?.name || 'その他'
        const existing = categoryData.get(categoryName) || {
          income: 0,
          expense: 0,
        }

        if (transaction.type === 'income') {
          existing.income += transaction.amount
        } else {
          existing.expense += transaction.amount
        }

        categoryData.set(categoryName, existing)
      })

      return Array.from(categoryData.entries())
        .map(([name, data], index) => ({
          name,
          収入: data.income,
          支出: data.expense,
          合計: data.income + data.expense,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.合計 - a.合計)
    }

    return []
  }

  const data = prepareData()

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={value => `¥${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
                formatter={(value: number, name: string) => [
                  `¥${value.toLocaleString()}`,
                  name,
                ]}
              />
              <Line
                type="monotone"
                dataKey="収入"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: '#16a34a', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="支出"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="純収支"
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#2563eb', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={value => `¥${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
                formatter={(value: number, name: string) => [
                  `¥${value.toLocaleString()}`,
                  name,
                ]}
              />
              <Bar dataKey="収入" fill="#16a34a" />
              <Bar dataKey="支出" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="合計"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
                formatter={(value: number) => [
                  `¥${value.toLocaleString()}`,
                  '金額',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={value => `¥${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
                formatter={(value: number, name: string) => [
                  `¥${value.toLocaleString()}`,
                  name,
                ]}
              />
              <Area
                type="monotone"
                dataKey="収入"
                stackId="1"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="支出"
                stackId="1"
                stroke="#dc2626"
                fill="#dc2626"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card className="card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-container">{renderChart()}</div>
      </CardContent>
    </Card>
  )
}
