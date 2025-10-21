import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'
import { parseGroups, Bot } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'

type Props = {
  existingBot: Pick<Bot, 'id' | 'workspaceId'>
  userId: string
  hasFileUploadBlocks: boolean
}

export const parseBotPublishEvents = async ({
  existingBot,
  userId,
  hasFileUploadBlocks,
}: Props) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return []
  const events = []
  const existingPublishedBot = await prisma.botPublic.findFirst({
    where: {
      botId: existingBot.id,
    },
    select: {
      version: true,
      groups: true,
      settings: true,
    },
  })

  const isPublishingFileUploadBlockForTheFirstTime =
    hasFileUploadBlocks &&
    (!existingPublishedBot ||
      !parseGroups(existingPublishedBot.groups, {
        botVersion: existingPublishedBot.version,
      }).some((group) => group.blocks.some((block) => block.type === InputBlockType.FILE)))

  if (isPublishingFileUploadBlockForTheFirstTime)
    events.push({
      name: 'File upload block published',
      workspaceId: existingBot.workspaceId,
      botId: existingBot.id,
      userId,
    } as const)

  return events
}
