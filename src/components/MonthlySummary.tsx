'use client'

import React from 'react'

import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/lib/supabase'
import {
  calculateMonthlyBalance,
  formatCurrency,
  getMonthName,
} from '@/lib/utils'

interface MonthlySummaryProps {
  transactions: Transaction[]
  year: number
  month: number
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  transactions,
  year,
  month,
}) => {
  const { income, expense, balance } = calculateMonthlyBalance(transactions)

  const summaryCards = [
    {
      title: '収入',
      amount: income,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: '支出',
      amount: expense,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: '収支',
      amount: balance,
      icon: DollarSign,
      color: balance >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-blue-50' : 'bg-red-50',
      borderColor: balance >= 0 ? 'border-blue-200' : 'border-red-200',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {year}年{getMonthName(month)}の家計簿
        </h2>
        <p className="text-gray-600 mt-1">{transactions.length}件の取引</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map(card => {
          const Icon = card.icon
          return (
            <Card
              key={card.title}
              className={`${card.bgColor} ${card.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {card.title}
                  </span>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.title === '支出' && card.amount > 0 ? '-' : ''}
                  {formatCurrency(Math.abs(card.amount))}
                </div>
                {card.title === '収支' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {balance >= 0 ? '黒字' : '赤字'}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Visualization */}
      {income > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">支出割合</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>支出率</span>
                <span>{((expense / income) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((expense / income) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MonthlySummary
