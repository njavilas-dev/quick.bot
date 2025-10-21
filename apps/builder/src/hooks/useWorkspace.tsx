import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Workspace, WorkspaceBillingPlan, WorkspaceRole } from '@quickbot.io/prisma'
import { trpc } from '@/lib/trpc'
import { useUser } from '@/hooks/useUser'
import { RootState } from '@/store/store'
import { setWorkspaceId } from '@/store/workspace/workspaceReducer'
import { useLoadingSave } from '@/hooks/useLoadingSave'

export type WorkspaceInApp = Workspace & {
  billingPlan: WorkspaceBillingPlan
}

export const useWorkspace = () => {
  const dispatch = useDispatch()
  const { user } = useUser()
  const trpcContext = trpc.useContext()
  const setLoadingSave = useLoadingSave()
  const workspaceId = useSelector((state: RootState) => state.workspace.workspaceId)

  const { data: workspaceData } = trpc.workspace.getWorkspace.useQuery(
    { workspaceId: workspaceId ?? '' },
    {
      enabled: true, // Run the query if workspaceId is undefined to fetch the first workspace
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const { data: workspacesListData } = trpc.workspace.listWorkspaces.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })

  const workspace = workspaceData?.workspace as WorkspaceInApp
  const resolvedId = workspace?.id

  const switchCurrentWorkspace = (id: string) => {
    dispatch(setWorkspaceId(id))
  }

  useEffect(() => {
    if (resolvedId && workspaceId !== resolvedId) {
      switchCurrentWorkspace(resolvedId)
    }
  }, [resolvedId, workspaceId, dispatch])

  const [membersData, setMembersData] = useState<null | Array<{
    user: { email: string }
    workspaceId: string
    role: string
  }>>(null)

  useEffect(() => {
    if (!resolvedId) return

    const fetchMembers = async () => {
      try {
        const data = await trpcContext.workspace.listWorkspaceMembers.fetch({
          workspaceId: resolvedId,
        })
        setMembersData(
          data.members.map((member) => ({
            user: { email: member.user.email ?? '' },
            workspaceId: member.workspaceId,
            role: member.role,
          })),
        )
      } catch (e) {
        console.error('Error fetching workspace members:', e)
      }
    }

    fetchMembers()
  }, [resolvedId])

  const currentWorkspaceRole = useMemo(() => {
    return membersData?.find(
      (m) => m.user.email === user?.email && m.workspaceId === workspaceData?.workspace?.id,
    )?.role
  }, [membersData, user?.email, workspaceData?.workspace?.id])

  const updateWorkspaceMutation = trpc.workspace.updateWorkspace.useMutation({
    onSuccess: async () => {
      await trpcContext.workspace.getWorkspace.invalidate()
    },
  })

  const deleteWorkspaceMutation = trpc.workspace.deleteWorkspace.useMutation({
    onSuccess: async () => {
      await trpcContext.workspace.listWorkspaces.invalidate()
    },
  })

  const updateCurrentWorkspace = (workspaceData: {
    name?: string
    icon?: string
    billingEmail?: string
    billingCompany?: string
    billingVatType?: string
    billingVatValue?: string
  }) => {
    if (!workspaceId) return
    updateWorkspaceMutation.mutate({
      workspaceId,
      ...workspaceData,
    })
  }

  const deleteCurrentWorkspace = async () => {
    const id = workspaceData?.workspace?.id ?? workspaceId
    if (!id) return

    const data = (await trpcContext.workspace.listWorkspaces.fetch()) as {
      workspaces: WorkspaceInApp[]
    }
    if (!data?.workspaces || data.workspaces.length < 2) return

    const newWorkspaces = data.workspaces.filter((ws) => ws.id !== id)
    const newWorkspaceId = newWorkspaces[0]?.id
    if (!newWorkspaceId) return

    await deleteWorkspaceMutation.mutateAsync({ workspaceId: id })

    switchCurrentWorkspace(newWorkspaceId)
  }

  useEffect(() => {
    if (updateWorkspaceMutation.isLoading) {
      setLoadingSave()
    }
  }, [updateWorkspaceMutation.isLoading, setLoadingSave])

  useEffect(() => {
    if (deleteWorkspaceMutation.isLoading) {
      setLoadingSave()
    }
  }, [deleteWorkspaceMutation.isLoading, setLoadingSave])

  return {
    workspace,
    workspaceId: workspace?.id ?? workspaceId,
    workspaces: (workspacesListData?.workspaces as WorkspaceInApp[]) || [],
    currentWorkspaceRole: currentWorkspaceRole as WorkspaceRole | undefined,
    switchCurrentWorkspace,
    updateCurrentWorkspace,
    deleteCurrentWorkspace,
  }
}
