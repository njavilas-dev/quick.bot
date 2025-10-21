import { NextApiRequest, NextApiResponse } from 'next'
import { CollaborationType, WorkspaceRole, User } from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { canWriteBots } from '@quickbot.io/db-rules/canWriteBots'
import { badRequest, forbidden, methodNotAllowed, notAuthenticated } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { sendBotCollaboratorInvitationEmail } from '@quickbot.io/emails'
import { env } from '@quickbot.io/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const botId = getBotIdOrFail(req, res)
  if (!botId) return

  switch (req.method) {
    case 'GET':
      return handleGet(botId, user, res)
    case 'POST':
      return handlePost(botId, user, req, res)
    default:
      return methodNotAllowed(res)
  }
}

function getBotIdOrFail(req: NextApiRequest, res: NextApiResponse): string | null {
  const botId = req.query.botId as string | undefined
  if (!botId) {
    badRequest(res)
    return null
  }
  return botId
}

async function handleGet(botId: string, user: User, res: NextApiResponse) {
  const invitations = await prisma.botInvitation.findMany({
    where: { botId, bot: canReadBots(botId, user) },
  })
  res.send({ invitations })
}

async function handlePost(botId: string, user: User, req: NextApiRequest, res: NextApiResponse) {
  const bot = await prisma.bot.findFirst({
    where: canWriteBots(botId, user),
    include: { workspace: { select: { name: true } } },
  })
  if (!bot || !bot.workspaceId) return forbidden(res)

  const { email, type } = extractBody(req)
  if (!email || !type) return badRequest(res)

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  })

  if (existingUser) {
    await addExistingUserToBot(existingUser.id, botId, type, bot.workspaceId, res)
  } else {
    await prisma.botInvitation.create({
      data: { email: email.toLowerCase().trim(), type, botId },
    })
  }

  await sendBotCollaboratorInvitationEmail({
    to: email,
    hostEmail: user.email ?? '',
    url: `${env.NEXTAUTH_URL}/bots?workspaceId=${bot.workspaceId}`,
    guestEmail: email.toLowerCase(),
    botName: bot.name,
    workspaceName: bot.workspace?.name ?? '',
  })

  res.send({ message: 'success' })
}

function extractBody(req: NextApiRequest): {
  email: string | undefined
  type: CollaborationType | undefined
} {
  const body =
    (req.body as { email?: string; type?: CollaborationType }) ?? {}
  return { email: body.email, type: body.type }
}


const isUniqueConstraintError = (error: unknown) => typeof error === 'object' && error && 'code' in error && error.code === 'P2002'

async function addExistingUserToBot(
  userId: string,
  botId: string,
  type: CollaborationType,
  workspaceId: string,
  res: NextApiResponse
) {
  try {
    await prisma.botCollaborator.create({
      data: {
        type,
        botId,
        userId,
      },
    })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).send({
        message: 'User already has access to this bot.',
      })
    }
    throw error
  }

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    create: {
      role: WorkspaceRole.GUEST,
      userId,
      workspaceId,
    },
    update: {},
  })
}

export default handler
