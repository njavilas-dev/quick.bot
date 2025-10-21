import { router } from '@/helpers/server/trpc'
import { getInvitations } from './get-invitations'

export const invitationsRouter = router({
  getInvitations: getInvitations,
})
