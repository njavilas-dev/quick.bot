/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ResultValues,
  Bot,
  Variable,
  HttpRequest,
  Block,
  PublicBot,
  AnswerInSessionState,
} from '@quickbot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { byId } from '@quickbot.io/lib'
import { isWebhookBlock } from '@quickbot.io/schemas/helpers'
import { initMiddleware, methodNotAllowed, notFound } from '@quickbot.io/lib/api'
import Cors from 'cors'
import prisma from '@quickbot.io/lib/prisma'
import { getBlockById } from '@quickbot.io/schemas/helpers'
import {
  executeWebhook,
  parseWebhookAttributes,
} from '@quickbot.io/bot-engine/blocks/integrations/webhook/executeWebhookBlock'
import { fetchLinkedParentBots } from '@quickbot.io/bot-engine/blocks/logic/botLink/fetchLinkedParentBots'
import { fetchLinkedChildBots } from '@quickbot.io/bot-engine/blocks/logic/botLink/fetchLinkedChildBots'
import { parseSampleResult } from '@quickbot.io/bot-engine/blocks/integrations/webhook/parseSampleResult'
import { saveLog } from '@quickbot.io/bot-engine/logs/saveLog'
import { authenticateUser } from '@/helpers/authenticateUser'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const user = await authenticateUser(req)
    const botId = req.query.botId as string
    const blockId = req.query.blockId as string
    const resultId = req.query.resultId as string | undefined
    const { resultValues, variables, parentBotIds } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      resultValues: ResultValues
      variables: Variable[]
      parentBotIds: string[]
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
    const linkedBotsParents = (await fetchLinkedParentBots({
      isPreview: !('botId' in bot),
      parentBotIds,
      userId: user?.id,
    })) as (Bot | PublicBot)[]
    const linkedBotsChildren = await fetchLinkedChildBots({
      isPreview: !('botId' in bot),
      bots: [bot],
      userId: user?.id,
    })([])

    const linkedBots = [...linkedBotsParents, ...linkedBotsChildren]

    const answers = resultValues
      ? resultValues.answers.map((answer: any) => ({
          key:
            (answer.variableId
              ? bot.variables.find((variable) => variable.id === answer.variableId)?.name
              : bot.groups.find((group) =>
                  group.blocks.find((block) => block.id === answer.blockId),
                )?.title) ?? '',
          value: answer.content,
        }))
      : arrayify(await parseSampleResult(bot, linkedBots)(group.id, variables))

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
