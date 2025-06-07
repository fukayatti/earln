'use client'

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface CategoryChartProps {
  transactions: Transaction[]
  type: 'income' | 'expense'
}

interface CategoryData {
  name: string
  amount: number
  color: string
  percentage: number
}

const CategoryChart: React.FC<CategoryChartProps> = ({
  transactions,
  type,
}) => {
  const filteredTransactions = transactions.filter(t => t.type === type)

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

  const categoryData: CategoryData[] = filteredTransactions
    .reduce((acc, transaction) => {
      const categoryName = transaction.categories?.name || 'その他'
      const categoryColor = transaction.categories?.color || '#6b7280'

      const existing = acc.find(item => item.name === categoryName)
      if (existing) {
        existing.amount += transaction.amount
      } else {
        acc.push({
          name: categoryName,
          amount: transaction.amount,
          color: categoryColor,
          percentage: 0,
        })
      }
      return acc
    }, [] as CategoryData[])
    .map(item => ({
      ...item,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>{type === 'income' ? '📈' : '📉'}</span>
            <span>{type === 'income' ? '収入' : '支出'}カテゴリ別</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">データがありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{type === 'income' ? '📈' : '📉'}</span>
          <span>{type === 'income' ? '収入' : '支出'}カテゴリ別</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="relative">
          <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
            {categoryData.map(category => (
              <div
                key={category.name}
                className="transition-all duration-500"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                }}
                title={`${category.name}: ${formatCurrency(category.amount)} (${category.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {categoryData.map(category => (
            <div
              key={category.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(category.amount)}
                </div>
                <div className="text-xs text-gray-500">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">合計</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CategoryChart
