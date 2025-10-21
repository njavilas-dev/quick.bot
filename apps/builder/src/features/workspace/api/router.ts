import { router } from '@/helpers/server/trpc'
import { listWorkspaceMembers } from './listWorkspaceMembers'
import { listWorkspaces } from './listWorkspaces'
import { createWorkspace } from './createWorkspace'
import { deleteWorkspace } from './deleteWorkspace'
import { updateWorkspace } from './updateWorkspace'
import { getWorkspace } from './getWorkspace'

export const workspaceRouter = router({
  listWorkspaces,
  listWorkspaceMembers,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
})
