import prisma from '@quickbot.io/lib/prisma'
import { Block, Bot } from '@quickbot.io/schemas'
import { BillingPlanType } from '@quickbot.io/prisma'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { defaultSendEmailOptions } from '@quickbot.io/schemas/features/blocks/integrations/sendEmail/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { sessionOnlySetVariableOptions } from '@quickbot.io/schemas/features/blocks/logic/setVariable/constants'
import { isInputBlock } from '@quickbot.io/schemas/helpers'

export const sanitizeSettings = (
  settings: Bot['settings'],
  workspacePlan: BillingPlanType,
  mode: 'create' | 'update',
  hastWhatsapp: boolean,
): Bot['settings'] => ({
  ...settings,
  publicShare: mode === 'create' ? undefined : settings.publicShare,
  general:
    workspacePlan === BillingPlanType.FREE || settings.general
      ? {
        ...settings.general,
        isBrandingEnabled:
          workspacePlan === BillingPlanType.FREE ? true : settings.general?.isBrandingEnabled,
      }
      : undefined,
  whatsApp: settings.whatsApp
    ? {
      ...settings.whatsApp,
      isEnabled: mode === 'create' ? false : hastWhatsapp ? settings.whatsApp.isEnabled : false,
    }
    : undefined,
})

export const sanitizeGroups =
  (workspaceId: string) =>
    async (groups: Bot['groups']): Promise<Bot['groups']> =>
      Promise.all(
        groups.map(async (group) => ({
          ...group,
          blocks: await Promise.all(group.blocks.map(sanitizeBlock(workspaceId))),
        })),
      ) as Promise<Bot['groups']>

const sanitizeBlock =
  (workspaceId: string) =>
    async (block: Block): Promise<Block> => {
      if (!('options' in block) || !block.options) return block

      if (!('credentialsId' in block.options) || !block.options.credentialsId) return block

      switch (block.type) {
        case IntegrationBlockType.EMAIL:
          return {
            ...block,
            options: {
              ...block.options,
              credentialsId:
                (await sanitizeCredentialsId(workspaceId)(block.options?.credentialsId)) ??
                defaultSendEmailOptions.credentialsId,
            },
          }
        default:
          return {
            ...block,
            options: {
              ...block.options,
              credentialsId: await sanitizeCredentialsId(workspaceId)(block.options?.credentialsId),
            },
          }
      }
    }

const sanitizeCredentialsId =
  (workspaceId: string) =>
    async (credentialsId?: string): Promise<string | undefined> => {
      if (!credentialsId) return
      const credentials = await prisma.workspaceCredential.findFirst({
        where: {
          id: credentialsId,
          workspaceId,
        },
        select: {
          id: true,
        },
      })
      return credentials?.id
    }

export const isPublicIdNotAvailable = async (publicId: string) => {
  const botWithSameIdCount = await prisma.bot.count({
    where: {
      publicId,
    },
  })
  return botWithSameIdCount > 0
}

export const isCustomDomainNotAvailable = async ({
  customDomain,
  workspaceId,
}: {
  customDomain: string
  workspaceId: string
}) => {
  const domainCount = await prisma.workspaceCustomDomain.count({
    where: {
      workspaceId,
      name: customDomain.split('/')[0],
    },
  })
  if (domainCount === 0) return true

  const botWithSameDomainCount = await prisma.bot.count({
    where: {
      customDomain,
    },
  })

  return botWithSameDomainCount > 0
}

export const sanitizeFolderId = async ({
  folderId,
  workspaceId,
}: {
  folderId: string | null
  workspaceId: string
}) => {
  if (!folderId) return
  const folderCount = await prisma.workspaceDashboardFolder.count({
    where: {
      id: folderId,
      workspaceId,
    },
  })
  return folderCount !== 0 ? folderId : undefined
}

export const sanitizeCustomDomain = async ({
  customDomain,
  workspaceId,
}: {
  customDomain?: string | null
  workspaceId: string
}) => {
  if (!customDomain) return customDomain
  const domainCount = await prisma.workspaceCustomDomain.count({
    where: {
      name: customDomain?.split('/')[0],
      workspaceId,
    },
  })
  return domainCount === 0 ? null : customDomain
}

export const sanitizeVariables = ({
  variables,
  groups,
}: Pick<Bot, 'variables' | 'groups'>): Bot['variables'] => {
  const blocks = groups
    .flatMap((group) => group.blocks as Block[])
    .filter((b) => isInputBlock(b) || b.type === LogicBlockType.SET_VARIABLE)

  const seenNames = new Set<string>()
  const uniqueVariables = variables.filter((variable) => {
    const lowerName = variable.name.toLowerCase()
    if (seenNames.has(lowerName)) {
      return false
    }
    seenNames.add(lowerName)
    return true
  })

  return uniqueVariables.map((variable) => {
    // Check if variable is linked to forbidden SET_VARIABLE operations (these MUST be session-only)
    const isVariableSetToForbiddenResultVar = blocks.some(
      (block) =>
        block.type === LogicBlockType.SET_VARIABLE &&
        block.options?.variableId === variable.id &&
        sessionOnlySetVariableOptions.includes(
          block.options.type as (typeof sessionOnlySetVariableOptions)[number],
        ),
    )

    // Force session-only for forbidden operations (security constraint)
    if (isVariableSetToForbiddenResultVar)
      return {
        ...variable,
        isSavedVariable: true,
      }

    return variable
  })
}
