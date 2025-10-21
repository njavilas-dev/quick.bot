import prisma from '@quickbot.io/lib/prisma'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { generateId } from '@quickbot.io/lib'
import { PrismaClient } from '@quickbot.io/prisma'

/**
 * Creates a new email change request
 */
export const createEmailChangeRequest = async ({
  userId,
  currentEmail,
  newEmail,
}: {
  userId: string
  currentEmail: string
  newEmail: string
}) => {
  // Generate unique token
  const token = generateId(32)

  // Expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // Use transaction to ensure atomicity: cancel previous requests and create new one
  const emailChangeRequest = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
    // Cancel any previous pending email change request
    await tx.changeRequest.updateMany({
      where: {
        userId,
        type: 'EMAIL',
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    })

    // Create the new request
    const newRequest = await tx.changeRequest.create({
      data: {
        userId,
        type: 'EMAIL',
        newValue: newEmail,
        oldValue: currentEmail,
        token,
        expiresAt,
        status: 'PENDING',
        typeConfirmation: 'EMAIL',
      },
    })

    return newRequest
  })

  return emailChangeRequest
}

/**
 * Finds an email change request by token
 */
export const getEmailChangeRequestByToken = async (token: string) => {
  const emailChangeRequest = await prisma.changeRequest.findFirst({
    where: {
      token,
      type: 'EMAIL'
    },
    include: { user: true },
  })

  return emailChangeRequest
}

export type EmailChangeTokenValidation = {
  isValid: boolean
  isExpired: boolean | null
  request?: any
  errorType?: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'EMAIL_UNAVAILABLE'
}

/**
 * Validates if a token is valid and has not expired
 */
export const validateEmailChangeToken = async (token: string): Promise<EmailChangeTokenValidation> => {
  // Buscar el token sin filtro de expiración
  const request = await prisma.changeRequest.findFirst({
    where: {
      token,
      type: 'EMAIL',
      status: 'PENDING',
    },
    include: {
      user: true,
    },
  })

  if (!request) {
    return {
      isValid: false,
      isExpired: null, // Token no existe, no se puede determinar si está expirado
      errorType: 'INVALID_TOKEN',
    }
  }

  // Verificar si está expirado
  if (request.expiresAt <= new Date()) {
    return {
      isValid: false,
      isExpired: true,
      request,
      errorType: 'EXPIRED_TOKEN',
    }
  }

  // Verificar que el nuevo email esté disponible
  const existingUser = await prisma.user.findUnique({
    where: { email: request.newValue },
  })

  if (existingUser && existingUser.id !== request.userId) {
    return {
      isValid: false,
      isExpired: false,
      request,
      errorType: 'EMAIL_UNAVAILABLE',
    }
  }

  return {
    isValid: true,
    isExpired: false,
    request,
  }
}

/**
 * Confirms the email change and updates the user
 */
export const confirmEmailChange = async (token: string) => {
  const tokenValidation = await validateEmailChangeToken(token)

  if (!tokenValidation.isValid) {
    if (tokenValidation.errorType === 'EXPIRED_TOKEN') {
      throw new Error('Invalid or expired token')
    }
    if (tokenValidation.errorType === 'EMAIL_UNAVAILABLE') {
      throw new Error('Email is no longer available')
    }
    throw new Error('Invalid or expired token')
  }

  const emailChangeRequest = tokenValidation.request

  // Use transaction to ensure consistency
  const result = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
    // Update the user's email
    const updatedUser = await tx.user.update({
      where: { id: emailChangeRequest.userId },
      data: {
        email: emailChangeRequest.newValue,
        emailVerified: new Date(),
      },
    })

    // Update credentials so that username and providerAccountId match the new email
    await tx.userAuth.updateMany({
      where: {
        userId: emailChangeRequest.userId,
        provider: 'credentials'
      },
      data: {
        username: emailChangeRequest.newValue,
        providerAccountId: emailChangeRequest.newValue
      }
    })

    // Mark the request as confirmed
    await tx.changeRequest.update({
      where: { id: emailChangeRequest.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    })

    return updatedUser
  })

  return result
}

/**
 * Cancels all pending requests for a user
 */
export const cancelPendingEmailChangeRequests = async (userId: string) => {
  await prisma.changeRequest.updateMany({
    where: {
      userId,
      type: 'EMAIL',
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  })
}

/**
 * Gets the most recent pending request for a user
 */
export const getPendingEmailChangeRequest = async (userId: string) => {
  const pendingRequest = await prisma.changeRequest.findFirst({
    where: {
      userId,
      type: 'EMAIL',
      status: 'PENDING',
      expiresAt: { gt: new Date() }, // Not expired
    },
    orderBy: { createdAt: 'desc' },
  })

  return pendingRequest
}

/**
 * Cleans up expired requests (maintenance function)
 */
export const cleanupExpiredEmailChangeRequests = async () => {
  const expiredRequests = await prisma.changeRequest.updateMany({
    where: {
      type: 'EMAIL',
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: {
      status: 'EXPIRED',
    },
  })

  return expiredRequests.count
}

/**
 * Checks if an email is being used in a pending request
 */
export const isEmailInPendingRequest = async (email: string) => {
  const pendingRequest = await prisma.changeRequest.findFirst({
    where: {
      newValue: email,
      type: 'EMAIL',
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
  })

  return !!pendingRequest
}
