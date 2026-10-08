// NextAuth configuration — Credentials provider backed by Prisma User model.
// Production should add OAuth (Google, etc.) and JWT strategy for sessions.
//
// Per engineering §10:
//   - Passwords hashed with Argon2id (or bcrypt with sufficient cost)
//   - Sessions are short-lived JWTs
//   - Login endpoint is rate-limited (see middleware.ts)
//   - 2FA enforced for sensitive operations

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          // Find by email OR phone
          const user = await db.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { phone: credentials.email },
              ],
            },
          })
          if (!user || !user.passwordHash) return null
          if (user.status !== 'active') return null

          // Verify password
          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null

          // Update last login
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: null,
          }
        } catch (e) {
          console.error('[nextauth] authorize error:', e)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).email = token.email
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-only-secret-change-in-production',
}
