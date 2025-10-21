import prisma from '@quickbot.io/lib/prisma'
import { getAuthOptions } from '@/pages/api/auth/[...nextauth]'
import * as Sentry from '@sentry/nextjs'
import { User } from '@quickbot.io/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

export const getAuthenticatedUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<User | undefined> => {
  const bearerToken = extractBearerToken(req)
  if (bearerToken) return authenticateByToken(bearerToken)
  const user = (await getServerSession(req, res, getAuthOptions({})))?.user as User;
  if (!user || !('id' in user)) return
  Sentry.setUser({ id: user.id })
  return user
}

const authenticateByToken = async (apiToken: string): Promise<User | undefined> => {
  if (typeof window !== 'undefined') return
  const user = (await prisma.user.findFirst({
    where: { apiTokens: { some: { token: apiToken } } },
  })) as User
  if (user) {
    Sentry.setUser({ id: user.id })
  }
  return user
}

const extractBearerToken = (req: NextApiRequest) => req.headers['authorization']?.slice(7)
