import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { generatePresignedPostPolicy } from '@quickbot.io/lib/s3/generatePresignedPostPolicy'
import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'
import { getSession } from '@quickbot.io/bot-engine/queries/getSession'
import { FileInputBlock, parseGroups, TextInputBlock } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { getBlockById } from '@quickbot.io/schemas/helpers'
import { BotPublic } from '@quickbot.io/prisma'

export const generateUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v2/generate-upload-url',
      summary: 'Generate upload URL',
      description: 'Used to upload anything from the client to S3 bucket',
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
      fileName: z.string(),
      fileType: z.string().optional(),
    }),
  )
  .output(
    z.object({
      presignedUrl: z.string(),
      formData: z.record(z.string(), z.any()),
      fileUrl: z.string(),
    }),
  )
  .mutation(async ({ input: { fileName, sessionId, fileType } }) => {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      })

    const session = await getSession(sessionId)

    if (!session)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find session",
      })

    const botId = session.state.botsQueue[0].bot.id

    const isPreview = !session.state.botsQueue[0].resultId

    const bot = session.state.botsQueue[0].resultId
      ? await getAndParsePublicBot(session.state.botsQueue[0].bot.id)
      : session.state.botsQueue[0].bot

    if (!bot?.version)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find bot",
      })

    if (session.state.currentBlockId === undefined)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Can't find currentBlockId in session state",
      })

    const { block } = getBlockById(
      session.state.currentBlockId,
      parseGroups(bot.groups, {
        botVersion: bot.version,
      }),
    )

    if (
      block?.type !== InputBlockType.FILE &&
      (block.type !== InputBlockType.TEXT || !block.options?.attachments?.isEnabled) &&
      (block.type !== InputBlockType.TEXT || !block.options?.audioClip?.isEnabled)
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Current block does not expect file upload',
      })

    const { visibility, maxFileSize } = parseFileUploadParams(block)

    const resultId = session.state.botsQueue[0].resultId

    const filePath =
      'workspaceId' in bot && bot.workspaceId && resultId
        ? `${visibility === 'Private' ? 'private' : 'public'}/workspaces/${bot.workspaceId
        }/analytics/${botId}/answers/${resultId}/${fileName}`
        : `public/tmp/${botId}/${fileName}`

    const presignedPostPolicy = await generatePresignedPostPolicy({
      fileType,
      filePath,
      maxFileSize,
    })

    return {
      presignedUrl: presignedPostPolicy.postURL,
      formData: presignedPostPolicy.formData,
      fileUrl:
        visibility === 'Private' && !isPreview
          ? `${env.NEXTAUTH_URL}/api/analytics/${botId}/answers/${resultId}/${fileName}`
          : env.S3_PUBLIC_CUSTOM_DOMAIN
            ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
            : `${presignedPostPolicy.postURL}/${presignedPostPolicy.formData.key}`,
    }
  })

const getAndParsePublicBot = async (botId: string) => {
  const botPublic = (await prisma.botPublic.findFirst({
    where: {
      botId,
    },
    select: {
      version: true,
      groups: true,
      bot: {
        select: {
          workspaceId: true,
        },
      },
    },
  })) as (BotPublic & { bot: { workspaceId: string } }) | null

  return {
    ...botPublic,
    workspaceId: botPublic?.bot.workspaceId,
  }
}

const parseFileUploadParams = (
  block: FileInputBlock | TextInputBlock,
): { visibility: 'Public' | 'Private'; maxFileSize: number | undefined } => {
  if (block.type === InputBlockType.FILE) {
    return {
      visibility: block.options?.visibility === 'Private' ? 'Private' : 'Public',
      maxFileSize:
        block.options && 'sizeLimit' in block.options
          ? (block.options.sizeLimit as number)
          : env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
    }
  }

  return {
    visibility: block.options?.attachments?.visibility === 'Private' ? 'Private' : 'Public',
    maxFileSize: env.NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE,
  }
}
