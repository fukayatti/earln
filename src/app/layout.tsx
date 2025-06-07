import { Inter } from 'next/font/google'

import Layout from '@/components/Layout'
import SessionProvider from '@/components/SessionProvider'

import type { Metadata, Viewport } from 'next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EARLN - プロフェッショナル財務管理システム',
  description:
    '高度なデータ分析機能とインテリジェントなグラフ機能を搭載した、次世代の家計簿アプリケーション',
  keywords: [
    '家計簿',
    '財務管理',
    'データ分析',
    'グラフ',
    'Supabase',
    'Next.js',
  ],
  authors: [{ name: 'EARLN Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SessionProvider>
          <Layout>{children}</Layout>
        </SessionProvider>
      </body>
    </html>
  )
}
