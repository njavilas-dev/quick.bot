import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@quickbot.io/lib/prisma'
import { Group } from '@quickbot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { isNotDefined } from '@quickbot.io/lib'
import { isWebhookBlock } from '@quickbot.io/schemas/helpers'
import { methodNotAllowed } from '@quickbot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const botId = req.query.botId as string
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        workspace: { members: { some: { userId: user.id } } },
      },
      select: { groups: true, webhooks: true },
    })
    const emptyWebhookBlocks = (bot?.groups as Group[]).reduce<
      { groupId: string; id: string; name: string }[]
    >((emptyWebhookBlocks, group) => {
      const blocks = group.blocks.filter(
        (block) =>
          isWebhookBlock(block) &&
          isNotDefined(
            bot?.webhooks.find((w) => {
              if ('id' in w && 'webhookId' in block) return w.id === block.webhookId
              return false
            })?.url,
          ),
      )
      return [
        ...emptyWebhookBlocks,
        ...blocks.map((b) => ({
          id: b.id,
          groupId: group.id,
          name: `${group.title} > ${b.id}`,
        })),
      ]
    }, [])
    return res.send({ steps: emptyWebhookBlocks })
  }
  return methodNotAllowed(res)
}

export default handler
