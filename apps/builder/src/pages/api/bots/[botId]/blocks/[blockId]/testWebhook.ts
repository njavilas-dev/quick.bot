import { Bot, Variable, HttpRequest, Block, AnswerInSessionState } from '@quickbot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { byId } from '@quickbot.io/lib'
import { isWebhookBlock } from '@quickbot.io/schemas/helpers'
import { methodNotAllowed, notFound } from '@quickbot.io/lib/api'
import prisma from '@quickbot.io/lib/prisma'
import { getBlockById } from '@quickbot.io/schemas/helpers'
import {
  executeWebhook,
  parseWebhookAttributes,
} from '@quickbot.io/bot-engine/blocks/integrations/webhook/executeWebhookBlock'
import { fetchLinkedChildBots } from '@quickbot.io/bot-engine/blocks/logic/botLink/fetchLinkedChildBots'
import { parseSampleResult } from '@quickbot.io/bot-engine/blocks/integrations/webhook/parseSampleResult'
import { saveLog } from '@quickbot.io/bot-engine/logs/saveLog'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const user = await getAuthenticatedUser(req, res)
    const botId = req.query.botId as string
    const blockId = req.query.blockId as string
    const resultId = req.query.resultId as string | undefined
    const { variables } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
      variables: Variable[]
    }
    const bot = (await prisma.bot.findUnique({
      where: { id: botId },
      include: { webhooks: true },
    })) as unknown as (Bot & { webhooks: HttpRequest[] }) | null
    if (!bot) return notFound(res)
    const block = bot.groups.flatMap<Block>((g) => g.blocks).find(byId(blockId))
    if (!block || !isWebhookBlock(block)) return notFound(res, 'Webhook block not found')
    const webhookId = 'webhookId' in block ? block.webhookId : undefined
    const webhook =
      block.options?.webhook ??
      bot.webhooks.find((w) => {
        if ('id' in w) return w.id === webhookId
        return false
      })
    if (!webhook)
      return res.status(404).send({ statusCode: 404, data: { message: `Couldn't find webhook` } })
    const { group } = getBlockById(blockId, bot.groups)
    const linkedBots = await fetchLinkedChildBots({
      isPreview: !('botId' in bot),
      bots: [bot],
      userId: user?.id,
    })([])

    const answers = arrayify(await parseSampleResult(bot, linkedBots)(group.id, variables))

    const parsedWebhook = await parseWebhookAttributes({
      webhook,
      isCustomBody: block.options?.isCustomBody,
      bot: {
        ...bot,
        variables: bot.variables.map((v) => {
          const matchingVariable = variables.find(byId(v.id))
          if (!matchingVariable) return v
          return { ...v, value: matchingVariable.value }
        }),
      },
      answers,
    })

    if (!parsedWebhook)
      return res.status(500).send({
        statusCode: 500,
        data: { message: `Couldn't parse webhook attributes` },
      })

    const { response, logs } = await executeWebhook(parsedWebhook, {
      timeout: block.options?.timeout,
    })

    if (resultId)
      await Promise.all(
        logs?.map((log) =>
          saveLog({
            message: log.description,
            details: log.details,
            status: log.status as 'error' | 'success' | 'info',
            resultId,
          }),
        ) ?? [],
      )

    return res.status(200).send(response)
  }
  return methodNotAllowed(res)
}

const arrayify = (obj: Record<string, string | boolean | undefined>): AnswerInSessionState[] =>
  Object.entries(obj)
    .map(([key, value]) => ({ key, value: value?.toString() }))
    .filter((a) => a.value) as AnswerInSessionState[]

export default handler
