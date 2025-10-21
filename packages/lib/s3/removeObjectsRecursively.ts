import { env } from '@quickbot.io/env'
import { initClient } from './initClient'

const removeObjectsRecursively = async (prefix: string) => {
  const minioClient = initClient()

  const bucketName = env.S3_BUCKET

  const objectsStream = minioClient.listObjectsV2(bucketName, prefix, true)

  for await (const obj of objectsStream) {
    try {
      await minioClient.removeObject(bucketName, obj.name)
    } catch (err) {
      console.error(`Error removing ${obj.name}:`, err)
    }
  }
}

export const removeObjectsFromWorkspace = async (workspaceId: string) => {
  await removeObjectsRecursively(`public/workspaces/${workspaceId}/`)
  await removeObjectsRecursively(`private/workspaces/${workspaceId}/`)
}

export const removeObjectsFromResult = async ({
  workspaceId,
  resultIds,
  botId,
}: {
  workspaceId: string
  resultIds: string[]
  botId: string
}) => {
  for (const resultId of resultIds) {
    await removeObjectsRecursively(
      `public/workspaces/${workspaceId}/analytics/${botId}/answers/${resultId}/`,
    )
  }
}

export const removeAllObjectsFromResult = async ({
  workspaceId,
  botId,
}: {
  workspaceId: string
  botId: string
}) => {
  await removeObjectsRecursively(`public/workspaces/${workspaceId}/analytics/${botId}/answers/`)
}

export const removeObjectsFromBot = async ({
  botId,
  workspaceId,
}: {
  botId: string
  workspaceId: string
}) => {
  await removeObjectsRecursively(`public/workspaces/${workspaceId}/bots/${botId}/`)
}

export const removeObjectsFromUser = async (userId: string) => {
  await removeObjectsRecursively(`public/users/${userId}/`)
}
