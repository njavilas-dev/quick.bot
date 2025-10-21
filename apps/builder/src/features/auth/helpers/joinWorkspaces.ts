import { PrismaClient, WorkspaceInvitation } from '@quickbot.io/prisma'

export const joinWorkspaces = async (
  p: PrismaClient,
  { id, email }: { id: string; email: string },
  invitations: WorkspaceInvitation[],
) => {
  await p.$transaction([
    p.workspaceMember.createMany({
      data: invitations.map((invitation) => ({
        workspaceId: invitation.workspaceId,
        role: invitation.type,
        userId: id,
      })),
      skipDuplicates: true,
    }),
    p.workspaceInvitation.deleteMany({
      where: {
        email,
      },
    }),
  ])
}
