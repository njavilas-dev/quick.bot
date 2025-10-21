import { BotInvitation, PrismaClient, WorkspaceRole } from '@quickbot.io/prisma'

export type InvitationWithWorkspaceId = BotInvitation & {
  bot: {
    workspaceId: string | null
  }
}

export const convertInvitationsToCollaborations = async (
  p: PrismaClient,
  { id, email }: { id: string; email: string },
  invitations: InvitationWithWorkspaceId[],
) => {
  await p.botCollaborator.createMany({
    data: invitations.map((invitation) => ({
      botId: invitation.botId,
      type: invitation.type,
      userId: id,
    })),
  })
  const workspaceInvitations = invitations.reduce<InvitationWithWorkspaceId[]>(
    (acc, invitation) =>
      acc.some((inv) => inv.bot.workspaceId === invitation.bot.workspaceId)
        ? acc
        : [...acc, invitation],
    [],
  )
  for (const invitation of workspaceInvitations) {
    if (!invitation.bot.workspaceId) continue
    await p.workspaceMember.createMany({
      data: [
        {
          userId: id,
          workspaceId: invitation.bot.workspaceId,
          role: WorkspaceRole.GUEST,
        },
      ],
      skipDuplicates: true,
    })
  }
  return p.botInvitation.deleteMany({
    where: {
      email,
    },
  })
}
