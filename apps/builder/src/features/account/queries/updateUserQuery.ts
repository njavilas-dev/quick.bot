import { sendRequest } from '@quickbot.io/lib'
import { User } from '@quickbot.io/schemas'

export const updateUserQuery = async (id: string, user: Partial<User>) =>
  sendRequest({
    url: `/api/users/${id}`,
    method: 'PATCH',
    body: user,
  })
