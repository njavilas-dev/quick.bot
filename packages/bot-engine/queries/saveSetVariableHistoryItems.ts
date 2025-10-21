import prisma from '@quickbot.io/lib/prisma'
import { Prisma } from '@quickbot.io/prisma'
import { SetVariableHistoryItem } from '@quickbot.io/schemas'

export const saveSetVariableHistoryItems = (setVariableHistory: SetVariableHistoryItem[]) =>
  prisma.botResultVariableHistory.createMany({
    data: setVariableHistory.map((item) => ({
      ...item,
      value: item.value === null ? Prisma.JsonNull : item.value,
    })),
    skipDuplicates: true,
  })
