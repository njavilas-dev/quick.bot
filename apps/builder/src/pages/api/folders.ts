import { WorkspaceDashboardFolder, WorkspaceRole } from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, notAuthenticated } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'

// TODO: Delete as it has been migrated to TRPC endpoints
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const parentFolderId = req.query.parentId ? req.query.parentId.toString() : null

  if (req.method === 'GET') {
    const workspaceId = req.query.workspaceId as string | undefined
    if (!workspaceId) return badRequest(res)
    const folders = await prisma.workspaceDashboardFolder.findMany({
      where: {
        AND: [
          {
            parentFolderId,
            workspaceId: workspaceId,
          },
          {
            workspace: {
              members: {
                some: {
                  userId: user.id,
                  role: { not: WorkspaceRole.GUEST },
                },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.send({ folders })
  }
  if (req.method === 'POST') {
    const data = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Pick<
      WorkspaceDashboardFolder,
      'parentFolderId' | 'workspaceId'
    >
    const folder = await prisma.workspaceDashboardFolder.create({
      data: { ...data, name: 'New folder' },
    })
    return res.send(folder)
  }
  return methodNotAllowed(res)
}

export default handler
