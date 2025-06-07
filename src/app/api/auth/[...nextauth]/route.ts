import { createHash } from 'crypto'

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Google OAuth IDからUUIDを生成する関数
function generateUuidFromGoogleId(googleId: string): string {
  const hash = createHash('md5').update(googleId).digest('hex')
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-')
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 初回サインイン時にGoogleアカウント情報をトークンに保存
      if (account && profile) {
        // Google OAuth IDをUUID形式に変換
        const googleId = profile.sub || token.sub || ''
        token.sub = generateUuidFromGoogleId(googleId)
        token.email = profile.email || token.email
        token.name = profile.name || token.name
        token.picture =
          (profile as { picture?: string }).picture || token.picture
      }
      return token
    },
    async session({ session, token }) {
      // JWTトークンからセッションに情報をコピー
      if (token && session.user) {
        session.user.id = token.sub || ''
        session.user.email = token.email || null
        session.user.name = token.name || null
        session.user.image = token.picture || null
      }
      return session
    },
    async signIn({ account }) {
      // Googleアカウントでのサインインを許可
      if (account?.provider === 'google') {
        return true
      }
      return false
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
})

export { handler as GET, handler as POST }
