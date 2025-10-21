import prisma from '@quickbot.io/lib/prisma'
import { Credentials } from '@quickbot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { badRequest, forbidden, methodNotAllowed, notAuthenticated } from '@quickbot.io/lib/api'
import { encrypt } from '@quickbot.io/lib/api/encryption/encrypt'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const workspaceId = req.query.workspaceId as string | undefined
  if (!workspaceId) return badRequest(res)
  if (req.method === 'GET') {
    const credentials = await prisma.workspaceCredential.findMany({
      where: {
        workspace: { id: workspaceId, members: { some: { userId: user.id } } },
      },
      select: { name: true, type: true, workspaceId: true, id: true },
    })
    return res.send({ credentials })
  }
  if (req.method === 'POST') {
    const data = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Credentials
    const { encryptedData, iv } = await encrypt(data.data)
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId: user.id } } },
      select: { id: true },
    })
    if (!workspace) return forbidden(res)
    const credentials = await prisma.workspaceCredential.create({
      data: {
        ...data,
        data: encryptedData,
        iv,
        workspaceId,
      },
    })
    return res.send({ credentials })
  }
  return methodNotAllowed(res)
}

export default handler
