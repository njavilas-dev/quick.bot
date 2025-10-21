import React, { useState, useEffect } from 'react'
import { HStack, MenuItem, MenuDivider, Text, Spacer, Spinner } from '@chakra-ui/react'
import { ChevronDownIcon, PlusIcon } from '@urbiport/icons'
import { DropdownMenu, useToast } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'
import { PlanTag } from '@/features/billing/components/PlanTag'
import { BotIcon } from '@/components/BotIcon'
import { useUser } from '@/hooks/useUser'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { parseNewName } from '@/features/workspace/helpers/parseNewName'

export const WorkspaceDropdown = () => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const trpcContext = trpc.useContext()
  const { user } = useUser()

  // Local state for loading state and action message
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  // State for display name to avoid empty display
  const [displayName, setDisplayName] = useState<string | undefined>(undefined)

  const { workspace, switchCurrentWorkspace } = useWorkspace()

  const { data: workspacesData, isLoading: isWorkspacesLoading } =
    trpc.workspace.listWorkspaces.useQuery(undefined, {
      enabled: !!user,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    })
  const workspaces = workspacesData?.workspaces

  // Update display name when workspace changes
  useEffect(() => {
    if (workspace?.name) {
      setDisplayName(workspace.name)
    }
  }, [workspace])

  const createWorkspaceMutation = trpc.workspace.createWorkspace.useMutation({
    onError: (error) => {
      showToast({
        status: 'error',
        description: error.message,
      })
      // Reset state if creation fails
      setIsLoading(false)
      setLoadingMessage('')
    },
    onSuccess: async () => {
      await trpcContext.workspace.listWorkspaces.invalidate()
      setIsLoading(false)
      setLoadingMessage('')
    },
  })

  const handleCreateWorkspace = async (userFullName?: string) => {
    if (!workspaces) return

    setIsLoading(true)
    setLoadingMessage(t('workspace.actions.create'))

    try {
      const name = parseNewName(userFullName, workspaces)
      const { workspace } = await createWorkspaceMutation.mutateAsync({ name })
      // Update display immediately
      setDisplayName(name)
      // Once workspace is created, switch to it
      switchCurrentWorkspace(workspace.id)
      setIsLoading(false)
      setLoadingMessage('')
    } catch (error) {
      console.error('Error creating workspace:', error)
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !workspace) {
      setDisplayName(workspaces[0].name)
    }
  }, [workspaces, workspace])

  let menuButtonContent: React.ReactNode

  if (workspace?.name) {
    menuButtonContent = workspace.name
  } else if (!workspace && !isWorkspacesLoading && workspaces && workspaces.length > 0) {
    menuButtonContent = workspaces[0].name
  } else if (displayName) {
    menuButtonContent = displayName
  } else if (!isWorkspacesLoading && workspaces?.length === 0) {
    menuButtonContent = 'No workspaces'
  } else {
    menuButtonContent = <Spinner />
  }

  return (
    <DropdownMenu
      placement="bottom-start"
      matchWidth={false}
      menuButton={menuButtonContent}
      menuButtonProps={{
        'aria-label': 'Switch Workspace',
        isLoading: isLoading,
        loadingText: loadingMessage,
        rightIcon: <ChevronDownIcon />,
        variant: 'unstyled',
        bg: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {workspaces?.map((w) => (
        <MenuItem
          key={w.id}
          onClick={() => switchCurrentWorkspace(w.id)}
          aria-selected={workspace?.id === w.id ? 'true' : 'false'}
        >
          <HStack w="100%">
            <BotIcon icon={w.icon} size="16px" />
            <Text>{w.name}</Text>
            <Spacer />
            <PlanTag plan={w.billingPlan.key} ml="auto" />
          </HStack>
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem onClick={() => handleCreateWorkspace(user?.name ?? undefined)} icon={<PlusIcon />}>
        New Workspace
      </MenuItem>
    </DropdownMenu>
  )
}
