import prisma from '@quickbot.io/lib/prisma'
import { SmtpCredentials } from '@quickbot.io/schemas'
import { encrypt } from '@quickbot.io/lib/api/encryption/encrypt'
import { businessWorkspaceId } from '@quickbot.io/playwright/helpers'

export const createSmtpCredentials = async (id: string, smtpData: SmtpCredentials['data']) => {
  const existCredential = await prisma.workspaceCredential.findFirst({
    where: {
      id,
    },
  })

  if (existCredential) return

  const { encryptedData, iv } = await encrypt(smtpData)
  return prisma.workspaceCredential.create({
    data: {
      id,
      data: encryptedData,
      iv,
      name: smtpData.from.email as string,
      type: 'smtp',
      workspaceId: businessWorkspaceId,
    },
  })
}
