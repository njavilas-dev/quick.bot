import prisma from '@quickbot.io/lib/prisma'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { User } from '@quickbot.io/prisma'
import { NextApiRequest } from 'next'

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req)

  return {
    user,
    origin:
      (opts.req.headers['x-quickbot-iframe-referrer-origin'] as string | undefined) ??
      opts.req.headers.origin,
    res: opts.res,
  }
}

const getAuthenticatedUser = async (req: NextApiRequest): Promise<User | undefined> => {
  const bearerToken = extractBearerToken(req)
  if (!bearerToken) return
  return authenticateByToken(bearerToken)
}

const authenticateByToken = async (token: string): Promise<User | undefined> => {
  if (typeof window !== 'undefined') return
  const apiToken = await prisma.userApiToken.findFirst({
    where: {
      token,
    },
    select: {
      user: true,
    },
  })
  return apiToken?.user
}

const extractBearerToken = (req: NextApiRequest) => req.headers['authorization']?.slice(7)

export type Context = inferAsyncReturnType<typeof createContext>
