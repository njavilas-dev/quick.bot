import { PrismaClient, WorkspaceInvitation } from '@quickbot.io/prisma'
import { InvitationWithWorkspaceId } from './convertInvitationsToCollaborations'

export const getNewUserInvitations = async (
  p: PrismaClient,
  email: string,
): Promise<{
  invitations: InvitationWithWorkspaceId[]
  workspaceInvitations: WorkspaceInvitation[]
}> => {
  const [invitations, workspaceInvitations] = await p.$transaction([
    p.botInvitation.findMany({
      where: { email },
      include: { bot: { select: { workspaceId: true } } },
    }),
    p.workspaceInvitation.findMany({
      where: { email },
    }),
  ])

  return { invitations, workspaceInvitations }
}
