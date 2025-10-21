import { router } from '@/helpers/server/trpc'
import { getCollaborators } from './get-collaborators'

export const collaboratorsRouter = router({
  getCollaborators: getCollaborators,
})
