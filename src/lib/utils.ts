import { type ClassValue, clsx } from 'clsx'
import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

export function formatDate(
  date: string | Date,
  formatStr: string = 'yyyy年MM月dd日'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: ja })
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export function getMonthRange(
  year: number,
  month: number
): { start: Date; end: Date } {
  const date = new Date(year, month - 1, 1)
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function isDateInMonth(
  date: string | Date,
  year: number,
  month: number
): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const { start, end } = getMonthRange(year, month)
  return isWithinInterval(dateObj, { start, end })
}

export function getMonthName(month: number): string {
  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ]
  return monthNames[month - 1] || ''
}

export function calculateMonthlyBalance(
  transactions: Array<{ amount: number; type: 'income' | 'expense' }>
): { income: number; expense: number; balance: number } {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    income,
    expense,
    balance: income - expense,
  }
}
