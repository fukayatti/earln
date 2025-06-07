'use client'

import React from 'react'

import { ArrowDownRight, ArrowUpRight, Edit, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Transaction } from '@/lib/supabase'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500">まだ記録がありません</p>
          <p className="text-sm text-gray-400 mt-1">
            新しい記録を追加してみましょう
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <Card
          key={transaction.id}
          className="group hover:shadow-lg transition-all duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Type Icon */}
                <div
                  className={cn(
                    'p-2 rounded-full',
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>

                {/* Category Info */}
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        transaction.categories?.color || '#6b7280',
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {transaction.categories?.name || 'カテゴリなし'}
                    </h3>
                    {transaction.description && (
                      <p className="text-sm text-gray-500">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Amount */}
                <div className="text-right">
                  <div
                    className={cn(
                      'text-lg font-semibold',
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(transaction.transaction_date, 'MM/dd')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default TransactionList
