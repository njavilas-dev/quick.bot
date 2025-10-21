import { z } from 'zod'
import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceInvitationSchema, workspaceMemberSchema } from '@quickbot.io/schemas'

export const listWorkspaceMembers = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/workspaces/{workspaceId}/members',
      protect: true,
      summary: 'List members in workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe('[Where to find my workspace ID?](https://docs.quick.bot/api/authentication#how-to-find-my-workspaceid)'),
    }),
  )
  .output(
    z.object({
      members: z.array(workspaceMemberSchema),
      invitations: z.array(workspaceInvitationSchema),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            userId: user.id
          }
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        invitations: true,
      },
    })

    if (!workspace) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })
    }

    /**
     * The workspace is selected where the user is a member
     * if (isReadWorkspaceFobidden(workspace, user)) {
     * throw new TRPCError({
     *  code: 'FORBIDDEN',
     *  message: 'You are not allowed to access this workspace',
     * })
    }
     */

    return {
      members: workspace.members.map((member) => ({
        role: member.role,
        user: member.user,
        userId: member.userId,
        workspaceId,
      })),
      invitations: workspace.invitations.map((invitation) => ({
        id: invitation.id,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
        email: invitation.email,
        type: invitation.type,
      })),
    }
  })
