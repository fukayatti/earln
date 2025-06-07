'use client'

import React from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getMonthName } from '@/lib/utils'

interface MonthSelectorProps {
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  year,
  month,
  onMonthChange,
}) => {
  const goToPreviousMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  const goToCurrentMonth = () => {
    const now = new Date()
    onMonthChange(now.getFullYear(), now.getMonth() + 1)
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  }

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousMonth}
        className="h-10 w-10 p-0 hover:bg-white/50"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center space-x-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">
            {year}年{getMonthName(month)}
          </h3>
          {!isCurrentMonth() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToCurrentMonth}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              今月に戻る
            </Button>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextMonth}
        className="h-10 w-10 p-0 hover:bg-white/50"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default MonthSelector
