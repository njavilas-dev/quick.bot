import prisma from '@quickbot.io/lib/prisma'

export const getCredentials = async (credentialsId: string) =>
  prisma.workspaceCredential.findUnique({
    where: { id: credentialsId },
  })
