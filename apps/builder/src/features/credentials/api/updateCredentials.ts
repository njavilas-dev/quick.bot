import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { smtpCredentialsSchema } from '@quickbot.io/schemas/features/blocks/integrations/sendEmail'
import { encrypt } from '@quickbot.io/lib/api/encryption/encrypt'
import { z } from 'zod'
import { whatsAppCredentialsSchema } from '@quickbot.io/schemas/features/whatsapp'
import { googleSheetsCredentialsSchema, stripeCredentialsSchema } from '@quickbot.io/schemas'
import { isWriteWorkspaceForbidden } from '@quickbot.io/db-rules/isWriteWorkspaceForbidden'
import { forgedCredentialsSchemas } from '@quickbot.io/forge-repository/credentials'

const inputShape = {
  name: true,
  data: true,
  type: true,
  workspaceId: true,
} as const

export const updateCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/v1/credentials/{credentialsId}',
      protect: true,
      summary: 'Create credentials',
      tags: ['Credentials'],
    },
  })
  .input(
    z.object({
      credentialsId: z.string(),
      credentials: z.discriminatedUnion('type', [
        stripeCredentialsSchema.pick(inputShape),
        smtpCredentialsSchema.pick(inputShape),
        googleSheetsCredentialsSchema.pick(inputShape),
        whatsAppCredentialsSchema.pick(inputShape),
        ...Object.values(forgedCredentialsSchemas).map((i) => i.pick(inputShape)),
      ]),
    }),
  )
  .output(
    z.object({
      credentialsId: z.string(),
    }),
  )
  .mutation(async ({ input: { credentialsId, credentials }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: credentials.workspaceId,
      },
      select: {
        id: true,
        members: true,
      },
    })
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })

    const { encryptedData, iv } = await encrypt(credentials.data)
    const createdCredentials = await prisma.workspaceCredential.update({
      where: {
        id: credentialsId,
      },
      data: {
        name: credentials.name,
        data: encryptedData,
        iv,
      },
    })
    return { credentialsId: createdCredentials.id }
  })
