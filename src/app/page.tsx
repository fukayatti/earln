'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { BarChart3, Shield, TrendingUp, Users, Wallet, Zap } from 'lucide-react'
import { useSession } from 'next-auth/react'

import AuthButton from '@/components/AuthButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // 認証済みユーザーはダッシュボードにリダイレクト
    if (session?.user) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="professional-gradient rounded-2xl p-4">
                <Wallet className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-foreground">EARLN</h1>
            </div>

            <h2 className="text-4xl font-bold text-foreground mb-6">
              プロフェッショナルな
              <span className="text-primary block">財務管理システム</span>
            </h2>

            <p className="text-xl text-muted max-w-3xl mx-auto mb-12">
              EARLNは高度なデータ分析機能とインテリジェントなグラフ機能を搭載した、
              次世代の家計簿アプリケーションです。あなたの財務状況を可視化し、
              より良い金融判断をサポートします。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <AuthButton />
              <p className="text-sm text-muted">
                Googleアカウントで無料で始める
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            強力な機能
          </h3>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            EARLNの豊富な機能で、財務管理を効率化
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <span>高度な分析</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted">
                4種類のグラフタイプ（ライン、バー、パイ、エリア）で、
                収支の推移やカテゴリ別の分析を詳細に可視化
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <span>リアルタイム統計</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted">
                収入・支出・純収支をリアルタイムで計算。
                月別、四半期別、年別の統計で財務トレンドを把握
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <span>セキュア認証</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted">
                Google OAuth認証による安全なログイン。
                Supabaseクラウドインフラでデータを安全に保護
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <span>高速パフォーマンス</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted">
                Next.js 15とTurbopackによる超高速レンダリング。
                レスポンシブデザインでどのデバイスでも快適に利用
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <span>直感的なUI</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted">
                プロフェッショナルで洗練されたユーザーインターフェース。
                ダークモード対応で長時間の利用も快適
              </p>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <span>データエクスポート</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted">
                CSVエクスポート機能で、他のツールとの連携も簡単。
                データのバックアップや詳細分析に活用
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            今すぐ始めて、財務管理を次のレベルへ
          </h3>
          <p className="text-lg text-muted mb-8">
            無料で始められます。クレジットカード不要。
          </p>
          <AuthButton />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="professional-gradient rounded-lg p-2">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">EARLN</span>
          </div>
          <p className="text-center text-muted">
            © 2024 EARLN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
