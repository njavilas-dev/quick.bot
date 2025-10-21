import { withQueryLogging } from '@quickbot.io/lib/prisma'

const prismaWithLogging = withQueryLogging()

const cleanupFailedMigrations = async () => {

  await prismaWithLogging.$executeRaw`
    DELETE FROM _prisma_migrations WHERE finished_at IS NULL
  `
}

cleanupFailedMigrations()