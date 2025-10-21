import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Block, FileInputBlock, BotLinkBlock, parseGroups } from '@quickbot.io/schemas'
import { byId, isDefined } from '@quickbot.io/lib'
import { z } from 'zod'
import { generatePresignedUrl } from '@quickbot.io/lib/s3/deprecated/generatePresignedUrl'
import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { BotPublic } from '@quickbot.io/prisma'

export const getUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}/blocks/{blockId}/storage/upload-url',
      summary: 'Get upload URL for a file',
      description: 'Used for the web client to get the bucket upload file.',
      deprecated: true,
      tags: ['Deprecated'],
    },
  })
  .input(
    z.object({
      botId: z.string(),
      blockId: z.string(),
      filePath: z.string(),
      fileType: z.string().optional(),
    }),
  )
  .output(
    z.object({
      presignedUrl: z.string(),
      hasReachedStorageLimit: z.boolean(),
    }),
  )
  .query(async ({ input: { botId, blockId, filePath, fileType } }) => {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      })

    const botPublic = await prisma.botPublic.findFirst({
      where: { botId: botId },
      select: {
        version: true,
        groups: true,
        botId: true,
      },
    })

    if (!botPublic)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Bot not found',
      })

    const fileUploadBlock = await getFileUploadBlock(botPublic, blockId)

    if (!fileUploadBlock)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'File upload block not found',
      })

    const presignedUrl = await generatePresignedUrl({
      fileType,
      filePath,
    })

    return {
      presignedUrl,
      hasReachedStorageLimit: false,
    }
  })

const getFileUploadBlock = async (
  botPublic: Pick<BotPublic, 'groups' | 'botId' | 'version'>,
  blockId: string,
): Promise<FileInputBlock | null> => {
  const groups = parseGroups(botPublic.groups, {
    botVersion: botPublic.version,
  })
  const fileUploadBlock = groups.flatMap<Block>((group) => group.blocks).find(byId(blockId))
  if (fileUploadBlock?.type === InputBlockType.FILE) return fileUploadBlock
  const linkedBotIds = groups
    .flatMap<Block>((group) => group.blocks)
    .filter((block) => block.type === LogicBlockType.BOT_LINK)
    .flatMap((block) => (block as BotLinkBlock).options?.botId)
    .filter(isDefined)
  const linkedBots = await prisma.botPublic.findMany({
    where: { botId: { in: linkedBotIds } },
    select: {
      groups: true,
    },
  })
  const fileUploadBlockFromLinkedBots = parseGroups(
    linkedBots.flatMap((bot) => bot.groups),
    { botVersion: botPublic.version },
  )
    .flatMap<Block>((group) => group.blocks)
    .find(byId(blockId))
  if (fileUploadBlockFromLinkedBots?.type === InputBlockType.FILE)
    return fileUploadBlockFromLinkedBots
  return null
}
