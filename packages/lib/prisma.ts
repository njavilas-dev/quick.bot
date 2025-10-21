import { PrismaClient } from '@quickbot.io/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const createPrismaClient = () => {
  const isNeon = process.env.DATABASE_URL?.includes('neondb')
  let adapter
  if (isNeon) {
    adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL!,
    })
  }

  return new PrismaClient({
    ...(isNeon && { adapter }),
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  })
}

declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined //NOSONAR
}

const prisma =
  process.env.NODE_ENV === 'production'
    ? createPrismaClient()
    : global.prisma ?? (global.prisma = createPrismaClient())

export const withQueryLogging = () => {
  prisma.$on('query', (e) => {
    console.log(`Query: ${e.query}`)
    console.log(`Params: ${e.params}`)
    console.log(`Duration: ${e.duration}ms`)
  })
  return prisma
}

export default prisma
