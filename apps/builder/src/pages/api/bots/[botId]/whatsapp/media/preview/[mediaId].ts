import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated, notFound } from '@quickbot.io/lib/api'
import { isReadWorkspaceFobidden } from '@quickbot.io/db-rules/isReadWorkspaceFobidden'
import { downloadMedia } from '@quickbot.io/bot-engine/whatsapp/downloadMedia'
import { env } from '@quickbot.io/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    if (!env.META_SYSTEM_USER_TOKEN)
      return res.status(400).json({ error: 'Meta system user token is not set' })
    const user = await getAuthenticatedUser(req, res)
    if (!user) return notAuthenticated(res)

    const botId = req.query.botId as string

    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
      },
      select: {
        whatsAppCredentialsId: true,
        workspace: {
          select: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    if (!bot?.workspace || isReadWorkspaceFobidden(bot.workspace, user))
      return notFound(res, 'Workspace not found')

    if (!bot) return notFound(res, 'Bot not found')

    const mediaId = req.query.mediaId as string

    const { file, mimeType } = await downloadMedia({
      mediaId,
      systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
    })

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=86400')

    return res.send(file)
  }
  return methodNotAllowed(res)
}

export default handler
