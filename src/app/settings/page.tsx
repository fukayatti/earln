'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import {
  Bell,
  Download,
  FolderPlus,
  Settings,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { categoriesApi } from '@/lib/api'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isInitializingCategories, setIsInitializingCategories] =
    useState(false)

  useEffect(() => {
    if (status === 'loading') return // まだ読み込み中

    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
  }, [status, router])

  const handleExportData = () => {
    // データエクスポート機能（実装予定）
    alert('データエクスポート機能は準備中です')
  }

  const handleImportData = () => {
    // データインポート機能（実装予定）
    alert('データインポート機能は準備中です')
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm('アカウントを削除しますか？この操作は取り消すことができません。')
    ) {
      return
    }

    if (
      !confirm('本当にアカウントを削除しますか？すべてのデータが失われます。')
    ) {
      return
    }

    try {
      // NextAuthでのログアウト
      await signOut({ callbackUrl: '/' })
      alert('ログアウトしました。アカウント削除機能は現在準備中です。')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('ログアウト中にエラーが発生しました')
    }
  }

  const handleInitializeCategories = async () => {
    if (
      !confirm(
        'デフォルトカテゴリを追加しますか？既存のカテゴリは保持されます。'
      )
    ) {
      return
    }

    if (!session?.user?.id) {
      alert('ユーザー情報が取得できません。再度ログインしてください。')
      return
    }

    try {
      setIsInitializingCategories(true)
      await categoriesApi.initializeDefaultCategories(session.user.id)
      alert('カテゴリの初期化が完了しました！')
    } catch (error) {
      console.error('Error initializing categories:', error)
      alert('カテゴリの初期化中にエラーが発生しました')
    } finally {
      setIsInitializingCategories(false)
    }
  }

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

  if (!session?.user) {
    return null // リダイレクト中
  }

  const user = session.user

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted">アカウントとアプリケーションの設定</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>プロフィール情報</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="プロフィール画像"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {user?.name || 'ユーザー'}
                  </h3>
                  <p className="text-muted">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    表示名
                  </label>
                  <Input
                    placeholder="表示名を入力"
                    defaultValue={user?.name || ''}
                    disabled
                  />
                  <p className="text-xs text-muted mt-1">
                    現在、プロフィール編集は無効です
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    メールアドレス
                  </label>
                  <Input
                    placeholder="メールアドレス"
                    defaultValue={user?.email || ''}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>アプリケーション設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">通貨設定</h4>
                <select className="w-full h-10 px-3 rounded-lg border border-input bg-background">
                  <option value="JPY">日本円 (¥)</option>
                  <option value="USD">米ドル ($)</option>
                  <option value="EUR">ユーロ (€)</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium mb-2">言語設定</h4>
                <select className="w-full h-10 px-3 rounded-lg border border-input bg-background">
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium mb-2">テーマ設定</h4>
                <select className="w-full h-10 px-3 rounded-lg border border-input bg-background">
                  <option value="light">ライトモード</option>
                  <option value="dark">ダークモード</option>
                  <option value="auto">システム設定に従う</option>
                </select>
              </div>

              <Button className="btn-primary">設定を保存</Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>通知設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">メール通知</span>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">月次レポート</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">予算アラート</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="card">
            <CardHeader>
              <CardTitle>データ管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full btn-secondary"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                データをエクスポート
              </Button>
              <Button
                variant="outline"
                className="w-full btn-secondary"
                onClick={handleImportData}
              >
                <Upload className="h-4 w-4 mr-2" />
                データをインポート
              </Button>
              <Button
                variant="outline"
                className="w-full btn-secondary"
                onClick={handleInitializeCategories}
                disabled={isInitializingCategories}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                {isInitializingCategories ? '初期化中...' : 'カテゴリを初期化'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="card">
            <CardHeader>
              <CardTitle>アカウント統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">アカウントID</span>
                <span className="text-sm text-muted">{user?.id || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">プロバイダー</span>
                <span className="text-sm text-muted">Google</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">メールアドレス</span>
                <span className="text-sm text-muted">{user?.email || '-'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="card border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">危険な操作</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                アカウントを削除
              </Button>
              <p className="text-xs text-muted mt-2">
                この操作は取り消すことができません
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
