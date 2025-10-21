import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated, notFound } from '@quickbot.io/lib/api'
import { isReadWorkspaceFobidden } from '@quickbot.io/db-rules/isReadWorkspaceFobidden'
import { WhatsAppCredentials } from '@quickbot.io/schemas/features/whatsapp'
import { decrypt } from '@quickbot.io/lib/api/encryption/decrypt'
import { downloadMedia } from '@quickbot.io/bot-engine/whatsapp/downloadMedia'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
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
            credentials: {
              where: {
                type: 'whatsApp',
              },
            },
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
    const credentialsId = bot.whatsAppCredentialsId

    const credentials = bot.workspace.credentials.find(
      (credential) => credential.id === credentialsId,
    )

    if (!credentials) return notFound(res, 'Credentials not found')

    const credentialsData = (await decrypt(
      credentials.data,
      credentials.iv,
    )) as WhatsAppCredentials['data']

    const { file, mimeType } = await downloadMedia({
      mediaId,
      systemUserAccessToken: credentialsData.systemUserAccessToken,
    })

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=86400')

    return res.send(file)
  }
  return methodNotAllowed(res)
}

export default handler
