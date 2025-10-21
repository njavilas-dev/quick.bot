import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, options } from '@quickbot.io/lib/api'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { createId } from '@paralleldrive/cuid2'
import { getNewUserInvitations } from '@/features/auth/helpers/getNewUserInvitations'
import { env } from '@quickbot.io/env'
import { parseWorkspaceDefaultPlan } from '@/features/workspace/helpers/parseWorkspaceDefaultPlan'
import { generateId } from '@quickbot.io/lib'
import { WorkspaceRole } from '@quickbot.io/prisma'
import { PlanWithoutChatTiers, TelemetryEvent } from '@quickbot.io/schemas'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { convertInvitationsToCollaborations } from '@/features/auth/helpers/convertInvitationsToCollaborations'
import { joinWorkspaces } from '@/features/auth/helpers/joinWorkspaces'
import type { AdapterUser } from 'next-auth/adapters'
import { sendUserAuthVerifyAccountEmail } from '@quickbot.io/emails/src/emails/user-auth-verify-account-email'
import { sendUserAuthVerificationTokenEmail } from '@quickbot.io//emails/src/emails/user-auth-verification-token-email'

export type CreateUserData = { name: string; lastname: string; email: string }
export type LinkAccountData = {
  userId: string
  email: string
  password: string
  verifyToken: string
}

export const getUserByEmail = async (email: string) =>
  await prisma.user.findUnique({ where: { email }, include: { accounts: true } })

export const createUser = async (data: CreateUserData): Promise<AdapterUser> => {
  if (!data.email) throw Error('Provider did not forward email but it is required')
  const user = { id: createId(), email: data.email as string }
  const { invitations, workspaceInvitations } = await getNewUserInvitations(prisma, user.email)
  if (
    env.DISABLE_SIGNUP &&
    env.ADMIN_EMAIL?.every((email) => email !== user.email) &&
    invitations.length === 0 &&
    workspaceInvitations.length === 0
  )
    throw Error('New users are forbidden')

  const { id: billingPlanId, key } = (await prisma.workspaceBillingPlan.findFirst({
    where: {
      key: parseWorkspaceDefaultPlan(data.email),
    },
  })) as PlanWithoutChatTiers

  const workspaceName = data.name ? `${data.name}'s workspace` : `My workspace`
  const newWorkspaceData = {
    name: workspaceName,
    billingPlanId,
  }

  const createdUser = await prisma.user.create({
    data: {
      name: `${data.name} ${data.lastname}`,
      email: data.email,
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
        name: workspaceName,
        billingPlan: key,
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
  if (invitations.length > 0) await convertInvitationsToCollaborations(prisma, user, invitations)
  if (workspaceInvitations.length > 0) await joinWorkspaces(prisma, user, workspaceInvitations)
  return createdUser as AdapterUser
}

export const linkAccount = async (data: LinkAccountData) => {
  await prisma.userAuth.create({
    data: {
      userId: data.userId,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: data.email,
      username: data.email,
      password: data.password,
      is_verified: false,
      verify_token: data.verifyToken,
    },
  })
}

type SendVerifyEmail = {
  name: string,
  email: string,
  verifyToken: string,
  isExternalSite: boolean,
  redirectUrl?: string,
}

export const sendVerifyEmail = async (props: SendVerifyEmail): Promise<void> => {

  let url: string = `${env.NEXTAUTH_URL}/verify-email?token=${props.verifyToken}`

  if (!props.isExternalSite) {
    await sendUserAuthVerifyAccountEmail({ to: props.email, name: props.name, url })
  }

  if (props.isExternalSite && props.redirectUrl === undefined) {
    url = `${env.NEXTAUTH_URL}/verify-email?token=${props.verifyToken}`
  }

  if (props.redirectUrl !== undefined) {

    url = `${props.redirectUrl}token=${props.verifyToken}`
  }

  await sendUserAuthVerificationTokenEmail({
    to: props.email,
    name: props.name,
    token: props.verifyToken,
    url,
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)

  if (req.method !== 'POST') return methodNotAllowed(res)

  const { name, lastname, email, password, redirectUrl } = req.body

  if (!name || !lastname || !email || !password) return badRequest(res, 'All fields are required.')

  try {
    const isExternalSite = req.headers.origin !== env.NEXTAUTH_URL
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      const existingCredentialAccount = await prisma.userAuth.findFirst({
        where: {
          provider: 'credentials',
          userId: existingUser.id,
          username: email,
          verify_token: { not: null },
          is_verified: false,
        },
        include: {
          user: true,
        },
      })

      if (existingCredentialAccount) {
        try {
          await sendVerifyEmail({
            name: existingUser.name || name,
            email,
            verifyToken: existingCredentialAccount.verify_token as string,
            isExternalSite,
            redirectUrl,
          })

          await prisma.user.update({
            where: { id: existingCredentialAccount.user.id },
            data: { updatedAt: new Date() },
          })

          return res.status(200).json({
            message: 'Verification email has been resent.',
            resendAttempted: true,
          })
        } catch (error) {
          console.error('Failed to resend verification email:', error)
          return res.status(500).json({
            message: 'Failed to resend verification email. Please try again later.',
            resendAttempted: true,
          })
        }
      }
    }

    if (existingUser && existingUser.accounts.some((account) => account.type === 'credentials')) {
      return badRequest(res, 'Email is already in use.')
    }

    const user =
      existingUser ??
      (await createUser({
        name,
        lastname,
        email,
      }))

    const encryptedPassword = crypt(password)
    const verifyToken = crypt(`QuickBot#${Date.now()}`)

    await linkAccount({
      userId: user.id,
      email,
      password: encryptedPassword,
      verifyToken,
    })

    try {
      await sendVerifyEmail({ name, email, verifyToken, isExternalSite, redirectUrl })

      return res.status(201).send({
        message: 'User created successfully.',
      })
    } catch (error) {
      console.error('Failed to send verification email:', error)

      // Cleanup the created user since email verification failed
      try {
        await prisma.userAuth.delete({
          where: {
            provider_providerAccountId: {
              provider: 'credentials',
              providerAccountId: email,
            },
          },
        })
        await prisma.user.delete({
          where: { id: user.id },
        })
      } catch (cleanupError) {
        console.error('Failed to clean up user after email send failure:', cleanupError)
        // Continue with error response even if cleanup fails
      }

      // Get the actual error message or use a default
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send verification email. Please try again later.'

      return res.status(500).send({
        message: errorMessage,
      })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'An unexpected error occurred.' })
  }
}

export default handler
