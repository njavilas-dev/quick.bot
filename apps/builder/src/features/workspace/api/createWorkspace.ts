import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { PlanWithoutChatTiers, Workspace, workspaceSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { parseWorkspaceDefaultPlan } from '../helpers/parseWorkspaceDefaultPlan'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'

export const createWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/workspaces',
      protect: true,
      summary: 'Create workspace',
      tags: ['Workspace'],
    },
  })
  .input(z.object({ icon: z.string().optional(), name: z.string() }))
  .output(
    z.object({
      workspace: workspaceSchema.omit({
        chatsLimitFirstEmailSentAt: true,
        chatsLimitSecondEmailSentAt: true,
        storageLimitFirstEmailSentAt: true,
        storageLimitSecondEmailSentAt: true,
        customChatsLimit: true,
        customMembersLimit: true,
        customStorageLimit: true,
        additionalChatsIndex: true,
        additionalStorageIndex: true,
        isQuarantined: true,
      }),
    }),
  )
  .mutation(async ({ input: { name, icon }, ctx: { user } }) => {

    const existingWorkspaceNames = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      select: { name: true },
    }) as Pick<Workspace, 'name'>[]

    if (existingWorkspaceNames.some((workspace) => workspace.name === name))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Workspace with same name already exists',
      })

    const defaultPlanKey = parseWorkspaceDefaultPlan(user.email ?? '')
    const billingPlan = await prisma.workspaceBillingPlan.findFirst({
      where: {
        key: defaultPlanKey,
      },
    }) as PlanWithoutChatTiers

    if (!billingPlan) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Billing plan not found',
      })
    }

    const newWorkspace = await prisma.$transaction(async (tx) => {
      return (await tx.workspace.create({
        data: {
          name,
          icon,
          members: { create: [{ role: 'ADMIN', userId: user.id }] },
          billingPlanId: billingPlan.id,
        },
        include: {
          billingPlan: true,
        },
      })) as Workspace
    })

    trackEvents([
      {
        name: 'Workspace created',
        workspaceId: newWorkspace.id,
        userId: user.id,
        data: {
          name,
          billingPlan: billingPlan.key,
        },
      },
    ]).catch(error => {
      console.error('Failed to track workspace creation event', error)
    })

    return {
      workspace: newWorkspace,
    }
  })
