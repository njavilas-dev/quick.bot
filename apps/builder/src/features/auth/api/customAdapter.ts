// Forked from https://github.com/nextauthjs/adapters/blob/main/packages/prisma/src/index.ts
import { PrismaClient, Prisma, WorkspaceRole, UserSession } from '@quickbot.io/prisma'
import type { Adapter, AdapterUser, VerificationToken } from 'next-auth/adapters'
import { createId } from '@quickbot.io/lib/createId'
import { generateId } from '@quickbot.io/lib'
import { TelemetryEvent } from '@quickbot.io/schemas/features/telemetry'
import { convertInvitationsToCollaborations } from '@/features/auth/helpers/convertInvitationsToCollaborations'
import { getNewUserInvitations } from '@/features/auth/helpers/getNewUserInvitations'
import { joinWorkspaces } from '@/features/auth/helpers/joinWorkspaces'
import { parseWorkspaceDefaultPlan } from '@/features/workspace/helpers/parseWorkspaceDefaultPlan'
import { env } from '@quickbot.io/env'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { PlanWithoutChatTiers } from '@quickbot.io/schemas'
import prisma from '@quickbot.io/lib/prisma'

export function customAdapter(p: PrismaClient): Adapter {
  return {
    createUser: async (data: Omit<AdapterUser, 'id'>): Promise<AdapterUser> => {
      if (!data.email) throw Error('Provider did not forward email but it is required')
      const user = { id: createId(), email: data.email as string }
      const { invitations, workspaceInvitations } = await getNewUserInvitations(p, user.email)
      if (
        env.DISABLE_SIGNUP &&
        env.ADMIN_EMAIL?.every((email) => email !== user.email) &&
        invitations.length === 0 &&
        workspaceInvitations.length === 0
      )
        throw Error('New users are forbidden')

      const { id: billingPlanId, key: billingPlan } = (await p.workspaceBillingPlan.findFirst({
        where: {
          key: parseWorkspaceDefaultPlan(data.email),
        },
      })) as PlanWithoutChatTiers

      const newWorkspaceData = {
        name: data.name ? `${data.name}'s workspace` : `My workspace`,
        billingPlanId,
      }

      const createdUser = await p.user.create({
        data: {
          ...data,
          id: user.id,
          apiTokens: {
            create: { name: 'Default', token: generateId(24) },
          },
          workspaces:
            workspaceInvitations.length > 0
              ? undefined
              : {
                  create: {
                    role: WorkspaceRole.ADMIN,
                    workspace: {
                      create: newWorkspaceData,
                    },
                  },
                },
          onboardingCategories: [],
        },
        include: {
          workspaces: { select: { workspaceId: true } },
        },
      })

      await prisma.userNotification.create({
        data: {
          almostReachedChatsLimit: true,
          reachedChatsLimit: true,
          botAnswersResult: true,
          userId: createdUser.id,
        },
      })

      const newWorkspaceId = createdUser.workspaces.pop()?.workspaceId
      const events: TelemetryEvent[] = []
      if (newWorkspaceId) {
        events.push({
          name: 'Workspace created',
          workspaceId: newWorkspaceId,
          userId: createdUser.id,
          data: {
            name: newWorkspaceData.name,
            billingPlan,
          },
        })
      }
      events.push({
        name: 'User created',
        userId: createdUser.id,
        data: {
          email: data.email,
          name: data.name ? (data.name as string).split(' ')[0] : undefined,
        },
      })
      await trackEvents(events)
      if (invitations.length > 0) await convertInvitationsToCollaborations(p, user, invitations)
      if (workspaceInvitations.length > 0) await joinWorkspaces(p, user, workspaceInvitations)
      return createdUser as AdapterUser
    },
    getUser: async (id) => (await p.user.findUnique({ where: { id } })) as AdapterUser,
    getUserByEmail: async (email) => (await p.user.findUnique({ where: { email } })) as AdapterUser,
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.userAuth.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      })
      return (account?.user ?? null) as AdapterUser | null
    },
    updateUser: async (data) =>
      (await p.user.update({ where: { id: data.id }, data })) as AdapterUser,
    deleteUser: async (id) => (await p.user.delete({ where: { id } })) as AdapterUser,
    linkAccount: async (data) => {
      await p.userAuth.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
          oauth_token_secret: data.oauth_token_secret as string,
          oauth_token: data.oauth_token as string,
          refresh_token_expires_in: data.refresh_token_expires_in as number,
        },
      })
    },
    unlinkAccount: async (provider_providerAccountId) => {
      await p.userAuth.delete({ where: { provider_providerAccountId } })
    },
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.userSession.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return { user, session } as { user: AdapterUser; session: UserSession }
    },
    createSession: (data) => p.userSession.create({ data }),
    updateSession: (data) =>
      p.userSession.update({ data, where: { sessionToken: data.sessionToken } }),
    deleteSession: (sessionToken) => p.userSession.delete({ where: { sessionToken } }),
    /**
     * Crea un token de verificación para el usuario.
     * IMPORTANTE: El objeto verificationToken debe incluir:
     *   - identifier: string
     *   - token: string
     *   - expires: Date
     * Además, se debe pasar botId como propiedad extra (por ejemplo, extendiendo VerificationToken).
     */
    createVerificationToken: async (verificationToken: VerificationToken) => {
      const botId = (verificationToken as { botId?: string }).botId;
      if (!botId) {
        throw new Error('Falta el campo botId al crear el token de verificación.');
      }
      const data = {
        botId,
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
      const created = await p.userVerificationToken.create({ data });
      // NextAuth espera que se retorne el mismo objeto que se recibe
      return {
        identifier: created.identifier,
        token: created.token,
        expires: created.expires,
      };
    },
    /**
     * Recupera y elimina un token de verificación de la base de datos.
     * NextAuth espera que reciba { identifier, token } y devuelva { identifier, token, expires } o null.
     */
    async useVerificationToken(params: { identifier: string; token: string }) {
      try {
        // Buscar el registro por identifier y token
        const found = await p.userVerificationToken.findFirst({
          where: {
            identifier: params.identifier,
            token: params.token,
          },
        });
        if (!found) return null;
        // Eliminar por id (clave única)
        const deleted = await p.userVerificationToken.delete({ where: { id: found.id } });
        return {
          identifier: deleted.identifier,
          token: deleted.token,
          expires: deleted.expires,
        };
      } catch (error) {
        if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') return null;
        throw error;
      }
    },
  }
}
