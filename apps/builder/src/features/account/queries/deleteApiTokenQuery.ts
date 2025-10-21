import { UserApiToken } from '@quickbot.io/prisma'
import { sendRequest } from '@quickbot.io/lib'

export const deleteApiTokenQuery = ({ userId, tokenId }: { userId: string; tokenId: string }) =>
  sendRequest<{ apiToken: UserApiToken }>({
    url: `/api/users/${userId}/api-tokens/${tokenId}`,
    method: 'DELETE',
  })
