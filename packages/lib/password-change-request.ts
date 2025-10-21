import prisma from '@quickbot.io/lib/prisma'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { generateId } from '@quickbot.io/lib'

export type PasswordChangeRequestData = {
  userId: string
  newPassword: string
  token: string
  expiresAt: Date
}

export type CreatePasswordChangeRequestData = {
  userId: string
  newPassword: string
}

export const createPasswordChangeRequest = async (
  data: CreatePasswordChangeRequestData
) => {
  const token = generateId(32)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // Expira en 24 horas

  const encryptedPassword = crypt(data.newPassword)

  const passwordChangeRequest = await prisma.changeRequest.create({
    data: {
      userId: data.userId,
      type: 'PASSWORD',
      newValue: encryptedPassword,
      oldValue: '', // Valor vacío para oldValue
      token,
      expiresAt,
      status: 'PENDING',
      typeConfirmation: 'EMAIL',
    },
  })

  return passwordChangeRequest
}

export const getPasswordChangeRequestByToken = async (token: string) => {
  return await prisma.changeRequest.findFirst({
    where: {
      token,
      type: 'PASSWORD',
      status: 'PENDING',
      expiresAt: {
        gt: new Date(), // No expirado
      },
    },
    include: {
      user: true,
    },
  })
}

export type PasswordChangeTokenValidation = {
  isValid: boolean
  isExpired: boolean | null
  request?: any
  errorType?: 'INVALID_TOKEN' | 'EXPIRED_TOKEN'
}

export const validatePasswordChangeToken = async (token: string): Promise<PasswordChangeTokenValidation> => {
  // Buscar el token sin filtro de expiración
  const request = await prisma.changeRequest.findFirst({
    where: {
      token,
      type: 'PASSWORD',
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

  return {
    isValid: true,
    isExpired: false,
    request,
  }
}

export const confirmPasswordChangeRequest = async (token: string) => {
  const passwordChangeRequest = await getPasswordChangeRequestByToken(token)

  if (!passwordChangeRequest) {
    throw new Error('Invalid or expired token')
  }

  // Actualizar la contraseña en userAuth
  await prisma.userAuth.updateMany({
    where: {
      userId: passwordChangeRequest.userId,
      provider: 'credentials',
    },
    data: {
      password: passwordChangeRequest.newValue,
    },
  })

  // Marcar el request como confirmado
  await prisma.changeRequest.update({
    where: {
      id: passwordChangeRequest.id,
    },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  })

  return passwordChangeRequest
}

export const cancelPasswordChangeRequest = async (token: string) => {
  return await prisma.changeRequest.updateMany({
    where: {
      token,
      type: 'PASSWORD',
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  })
}

export const getPendingPasswordChangeRequest = async (userId: string) => {
  return await prisma.changeRequest.findFirst({
    where: {
      userId,
      type: 'PASSWORD',
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const expireOldPasswordChangeRequests = async () => {
  return await prisma.changeRequest.updateMany({
    where: {
      type: 'PASSWORD',
      status: 'PENDING',
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: 'EXPIRED',
    },
  })
}
