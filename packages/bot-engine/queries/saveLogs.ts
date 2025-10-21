import prisma from '@quickbot.io/lib/prisma'
import { Log } from '@quickbot.io/schemas'

export const saveLogs = (logs: Omit<Log, 'id' | 'createdAt'>[]) =>
  prisma.botLog.createMany({ data: logs })
