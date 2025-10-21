import { WorkspaceInvitation, WorkspaceRole } from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { forbidden, methodNotAllowed, notAuthenticated } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { sendWorkspaceMemberInvitationEmail } from '@quickbot.io/emails'
import { env } from '@quickbot.io/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'POST') {
    const data = req.body as Omit<WorkspaceInvitation, 'id' | 'createdAt'>
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: data.workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
      include: {
        billingPlan: true,
      },
    })
    if (!workspace) return forbidden(res)

    const [existingMembersCount, existingInvitationsCount] = await prisma.$transaction([
      prisma.workspaceMember.count({
        where: { workspaceId: workspace.id },
      }),
      prisma.workspaceInvitation.count({
        where: { workspaceId: workspace.id },
      }),
    ])
    const membersLimit = workspace.billingPlan?.membersLimit ?? 'inf'
    if (membersLimit !== 'inf' && membersLimit <= existingMembersCount + existingInvitationsCount)
      return res.status(400).send('Seats limit reached')
    if (existingUser) {
      await prisma.workspaceMember.create({
        data: {
          role: data.type,
          workspaceId: data.workspaceId,
          userId: existingUser.id,
        },
      })
      await sendWorkspaceMemberInvitationEmail({
        to: data.email,
        workspaceName: workspace.name,
        guestEmail: data.email,
        url: `${env.NEXTAUTH_URL}/bots?workspaceId=${workspace.id}`,
        hostEmail: user.email ?? '',
      })
      return res.send({
        member: {
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: data.type,
          workspaceId: data.workspaceId,
        },
      })
    } else {
      const invitation = await prisma.workspaceInvitation.create({ data })
      await sendWorkspaceMemberInvitationEmail({
        to: data.email,
        workspaceName: workspace.name,
        guestEmail: data.email,
        url: `${env.NEXTAUTH_URL}/bots?workspaceId=${workspace.id}`,
        hostEmail: user.email ?? '',
      })
      return res.send({ invitation })
    }
  }
  methodNotAllowed(res)
}

export default handler
