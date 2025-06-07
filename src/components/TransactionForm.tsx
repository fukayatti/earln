'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { Category, Transaction } from '@/lib/supabase'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    data: Omit<
      Transaction,
      'id' | 'created_at' | 'updated_at' | 'categories' | 'user_id'
    >
  ) => void
  categories: Category[]
  transaction?: Transaction
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  transaction,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        type: transaction.type,
        category_id: transaction.category_id,
        description: transaction.description || '',
        transaction_date: transaction.transaction_date,
      })
    } else {
      setFormData({
        amount: '',
        type: 'expense',
        category_id: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
      })
    }
    setErrors({})
  }, [transaction, isOpen])

  const filteredCategories = categories.filter(
    cat => cat.type === formData.type
  )

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '金額を正しく入力してください'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'カテゴリを選択してください'
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = '日付を選択してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      amount: parseFloat(formData.amount),
      type: formData.type,
      category_id: formData.category_id,
      description: formData.description || undefined,
      transaction_date: formData.transaction_date,
    })

    onClose()
  }

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      category_id: '', // Reset category when type changes
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? '記録を編集' : '新しい記録を追加'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">種類</label>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant={formData.type === 'income' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleTypeChange('income')}
              className="flex-1 h-14 text-base font-medium"
            >
              <span className="text-2xl mr-3">💰</span>
              収入
            </Button>
            <Button
              type="button"
              variant={formData.type === 'expense' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleTypeChange('expense')}
              className="flex-1 h-14 text-base font-medium"
            >
              <span className="text-2xl mr-3">💸</span>
              支出
            </Button>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">金額</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
              ¥
            </span>
            <Input
              type="number"
              placeholder="1,000"
              value={formData.amount}
              onChange={e =>
                setFormData(prev => ({ ...prev, amount: e.target.value }))
              }
              className={`pl-8 text-lg ${errors.amount ? 'border-red-500' : ''}`}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[1000, 3000, 5000, 10000].map(amount => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData(prev => ({ ...prev, amount: amount.toString() }))
                }
                className="text-xs"
              >
                ¥{amount.toLocaleString()}
              </Button>
            ))}
          </div>

          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">カテゴリ</label>

          {/* Quick Category Buttons for common categories */}
          {formData.type === 'expense' && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {filteredCategories.slice(0, 6).map(category => (
                <Button
                  key={category.id}
                  type="button"
                  variant={
                    formData.category_id === category.id ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({ ...prev, category_id: category.id }))
                  }
                  className="text-xs truncate"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}

          <Select
            value={formData.category_id}
            onChange={e =>
              setFormData(prev => ({ ...prev, category_id: e.target.value }))
            }
            className={errors.category_id ? 'border-red-500' : ''}
          >
            <option value="">カテゴリを選択</option>
            {filteredCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {errors.category_id && (
            <p className="text-sm text-red-500">{errors.category_id}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            メモ（任意）
          </label>
          <Input
            type="text"
            placeholder="例：ランチ代、電車賃、給料など..."
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">日付</label>
          <Input
            type="date"
            value={formData.transaction_date}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                transaction_date: e.target.value,
              }))
            }
            className={errors.transaction_date ? 'border-red-500' : ''}
          />
          {errors.transaction_date && (
            <p className="text-sm text-red-500">{errors.transaction_date}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button type="submit" className="flex-1">
            {transaction ? '更新' : '追加'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TransactionForm
