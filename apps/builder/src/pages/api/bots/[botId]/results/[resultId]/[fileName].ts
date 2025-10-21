import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { badRequest, methodNotAllowed, notAuthenticated, notFound } from '@quickbot.io/lib/api'
import { getFileTempUrl } from '@quickbot.io/lib/s3/getFileTempUrl'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await getAuthenticatedUser(req, res)
    if (!user) return notAuthenticated(res)

    const botId = req.query.botId as string
    const resultId = req.query.resultId as string
    const fileName = req.query.fileName as string

    if (!fileName) return badRequest(res, 'fileName missing not found')

    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
      },
      select: {
        whatsAppCredentialsId: true,
        botCollaborators: {
          select: {
            userId: true,
          },
        },
        workspace: {
          select: {
            id: true,
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!bot?.workspace || (await isReadBotForbidden(bot, user)))
      return notFound(res, 'Workspace not found')

    if (!bot) return notFound(res, 'Bot not found')

    const tmpUrl = await getFileTempUrl({
      key: `private/workspaces/${bot.workspace.id}/analytics/${botId}/answers/${resultId}/${fileName}`,
    })

    if (!tmpUrl) return notFound(res, 'File not found')

    return res.redirect(tmpUrl)
  }
  return methodNotAllowed(res)
}

export default handler
