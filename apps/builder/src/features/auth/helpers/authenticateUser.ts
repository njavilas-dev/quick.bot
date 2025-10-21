import { PrismaClient } from '@quickbot.io/prisma'
import type { AdapterUser } from 'next-auth/adapters'
import { verify } from '@quickbot.io/lib/crypt-password'

export const authenticateUser = async (
  p: PrismaClient,
  username: string,
  password: string,
): Promise<AdapterUser | null> => {
  if (!username || !password) {
    throw new Error('Email and password are required.')
  }

  const provider = 'credentials'

  const account = await p.userAuth.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: username,
      },
      username: username,
    },
    include: { user: true },
  })
  if (!account || !account.password) {
    throw new Error('Invalid email or password.')
  }

  const isValidPassword = verify(password, account.password)
  if (!isValidPassword) {
    throw new Error('Invalid email or password.')
  }

  if (!account.is_verified) {
    throw new Error(`Your email isn't verified.`)
  }

  return (account?.user ?? null) as AdapterUser | null
}
