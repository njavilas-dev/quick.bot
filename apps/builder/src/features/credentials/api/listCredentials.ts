import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@quickbot.io/db-rules/isReadWorkspaceFobidden'
import { credentialsTypeSchema } from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib'

const deletedCredentialsTypes = ['zemanticAi', 'zemantic-ai']

const outputCredentialsSchema = z.array(
  z.object({
    id: z.string(),
    type: credentialsTypeSchema,
    name: z.string(),
  }),
)

export const listCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/credentials',
      protect: true,
      summary: 'List workspace credentials',
      tags: ['Credentials'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string().optional(),
      type: credentialsTypeSchema.optional(),
    }),
  )
  .output(
    z.object({
      credentials: outputCredentialsSchema,
    }),
  )
  .query(async ({ input: { workspaceId, type }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        members: true,
        credentials: {
          where: {
            type,
          },
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    return {
      credentials: outputCredentialsSchema.parse(
        isDefined(type)
          ? workspace.credentials
          : workspace.credentials
              .filter((c) => !deletedCredentialsTypes.includes(c.type))
              .sort((a, b) => a.type.localeCompare(b.type)),
      ),
    }
  })
