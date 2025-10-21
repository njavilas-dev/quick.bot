import { WorkspaceMember, WorkspaceRole } from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@quickbot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'PATCH') {
    const workspaceId = req.query.workspaceId as string
    const memberId = req.query.id as string
    const updates = req.body as Partial<WorkspaceMember>
    const member = await prisma.workspaceMember.updateMany({
      where: {
        userId: memberId,
        workspace: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
      data: { role: updates.role },
    })
    return res.status(200).json({
      member,
    })
  }
  if (req.method === 'DELETE') {
    const workspaceId = req.query.workspaceId as string
    const memberId = req.query.id as string
    const member = await prisma.workspaceMember.deleteMany({
      where: {
        userId: memberId,
        workspace: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
    })
    return res.status(200).json({
      member,
    })
  }
  methodNotAllowed(res)
}

export default handler
