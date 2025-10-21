import prisma from '@quickbot.io/lib/prisma'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { generateId } from '@quickbot.io/lib'

export type ChangeRequestType = 'EMAIL' | 'PASSWORD'
export type ChangeRequestStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED'
export type TypeConfirmation = 'EMAIL' | 'TWO_FACTOR' | 'SECURITY_KEY'

export type ChangeRequestData = {
  id: string
  userId: string
  type: ChangeRequestType
  status: ChangeRequestStatus
  typeConfirmation: TypeConfirmation
  token: string
  expiresAt: Date
  confirmedAt?: Date | null
  newValue: string
  oldValue: string
  createdAt: Date
  updatedAt: Date
}

export type CreateChangeRequestData = {
  userId: string
  type: ChangeRequestType
  newValue: string
  oldValue: string
  typeConfirmation?: TypeConfirmation
}

export const createChangeRequest = async (
  data: CreateChangeRequestData
): Promise<ChangeRequestData> => {
  const token = generateId(32)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // Expira en 24 horas

  // Encriptar la nueva contraseña si es un cambio de contraseña
  const processedNewValue = data.type === 'PASSWORD' ? crypt(data.newValue) : data.newValue
  const processedOldValue = data.type === 'PASSWORD' ? crypt(data.oldValue) : data.oldValue

  const changeRequest = await prisma.changeRequest.create({
    data: {
      userId: data.userId,
      type: data.type,
      newValue: processedNewValue,
      oldValue: processedOldValue,
      token,
      expiresAt,
      typeConfirmation: data.typeConfirmation || 'EMAIL',
    },
  })

  return changeRequest
}

export const getChangeRequestByToken = async (token: string) => {
  return await prisma.changeRequest.findFirst({
    where: {
      token,
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

export const confirmChangeRequest = async (token: string) => {
  const changeRequest = await getChangeRequestByToken(token)

  if (!changeRequest) {
    throw new Error('Invalid or expired token')
  }

  // Actualizar según el tipo de cambio
  if (changeRequest.type === 'EMAIL') {
    // Verificar que el nuevo email esté disponible
    const existingUser = await prisma.user.findUnique({
      where: { email: changeRequest.newValue },
    })

    if (existingUser && existingUser.id !== changeRequest.userId) {
      throw new Error('Email is no longer available')
    }

    // Actualizar email en la tabla User
    await prisma.user.update({
      where: { id: changeRequest.userId },
      data: {
        email: changeRequest.newValue,
        emailVerified: new Date(),
      },
    })

    // Actualizar credentials para que username y providerAccountId coincidan con el nuevo email
    await prisma.userAuth.updateMany({
      where: {
        userId: changeRequest.userId,
        provider: 'credentials'
      },
      data: {
        username: changeRequest.newValue,
        providerAccountId: changeRequest.newValue
      }
    })
  }

  if (changeRequest.type === 'PASSWORD') {
    // Actualizar contraseña en userAuth
    await prisma.userAuth.updateMany({
      where: {
        userId: changeRequest.userId,
        provider: 'credentials',
      },
      data: {
        password: changeRequest.newValue,
      },
    })
  }

  // Marcar el request como confirmado
  await prisma.changeRequest.update({
    where: {
      id: changeRequest.id,
    },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  })

  return changeRequest
}

export const cancelChangeRequest = async (token: string) => {
  return await prisma.changeRequest.updateMany({
    where: {
      token,
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  })
}

export const getPendingChangeRequest = async (userId: string, type?: ChangeRequestType) => {
  const whereClause: any = {
    userId,
    status: 'PENDING',
    expiresAt: {
      gt: new Date(),
    },
  }

  if (type) {
    whereClause.type = type
  }

  return await prisma.changeRequest.findFirst({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const getChangeRequestsByUser = async (userId: string, type?: ChangeRequestType) => {
  const whereClause: any = { userId }

  if (type) {
    whereClause.type = type
  }

  return await prisma.changeRequest.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export const getAllChangeRequests = async (filters?: {
  type?: ChangeRequestType
  status?: ChangeRequestStatus
  userId?: string
}) => {
  const whereClause: any = {}

  if (filters?.type) whereClause.type = filters.type
  if (filters?.status) whereClause.status = filters.status
  if (filters?.userId) whereClause.userId = filters.userId

  return await prisma.changeRequest.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export const expireOldChangeRequests = async () => {
  return await prisma.changeRequest.updateMany({
    where: {
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

export const createEmailChangeRequest = async (data: { userId: string; newEmail: string; currentEmail: string }) => {
  return await createChangeRequest({
    userId: data.userId,
    type: 'EMAIL',
    newValue: data.newEmail,
    oldValue: data.currentEmail,
  })
}

export const createPasswordChangeRequest = async (data: { userId: string; newPassword: string; oldPassword?: string }) => {
  return await createChangeRequest({
    userId: data.userId,
    type: 'PASSWORD',
    newValue: data.newPassword,
    oldValue: data.oldPassword || '',
  })
}

export const getPendingEmailChangeRequest = async (userId: string) => {
  return await getPendingChangeRequest(userId, 'EMAIL')
}

export const getPendingPasswordChangeRequest = async (userId: string) => {
  return await getPendingChangeRequest(userId, 'PASSWORD')
}

export const getEmailChangeRequestByToken = async (token: string) => {
  return await prisma.changeRequest.findFirst({
    where: {
      token,
      type: 'EMAIL'
    },
    include: { user: true },
  })
}

export const getPasswordChangeRequestByToken = async (token: string) => {
  return await prisma.changeRequest.findFirst({
    where: {
      token,
      type: 'PASSWORD',
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  })
}

export const confirmEmailChange = async (token: string) => {
  return await confirmChangeRequest(token)
}

export const confirmPasswordChangeRequest = async (token: string) => {
  return await confirmChangeRequest(token)
}

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

export const cancelPasswordChangeRequest = async (token: string) => {
  return await cancelChangeRequest(token)
}

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
