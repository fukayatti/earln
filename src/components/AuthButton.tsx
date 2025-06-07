'use client'

import Image from 'next/image'

import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'

import { Button } from '@/components/ui/button'

export default function AuthButton() {
  const { data: session, status } = useSession()

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <Button disabled className="btn-primary">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        読み込み中...
      </Button>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-muted">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'ユーザー'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-primary" />
            )}
          </div>
          <span className="hidden sm:block">
            {session.user.name || session.user.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="btn-secondary"
        >
          <LogOut className="w-4 h-4 mr-2" />
          ログアウト
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleSignIn} className="btn-primary">
      <LogIn className="w-4 h-4 mr-2" />
      Googleでログイン
    </Button>
  )
}
