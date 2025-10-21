import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'

const prismaWithLogging = withQueryLogging()

const cleanupFailedMigrations = async () => {
  await promptAndSetEnvironment()

  await prismaWithLogging.$executeRaw`
    DELETE FROM _prisma_migrations WHERE finished_at IS NULL
  `
}

cleanupFailedMigrations()
