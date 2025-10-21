import {
  Button,
  ButtonProps,
  MenuItem,
  Spacer,
  Text,
  Spinner,
  MenuDivider,
  Box,
  IconButton,
} from '@chakra-ui/react'
import { ChevronDownIcon, PlusIcon, TrashIcon, EditIcon, CloseIcon } from '@urbiport/icons'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { trpc } from '@/lib/trpc'
import { useWorkspace } from '@/hooks/useWorkspace'
import { ForgedBlockDefinition } from '@quickbot.io/forge-repository/types'
import { DropdownMenu, useToast } from '@urbiport/ui'
import { Credentials } from '@quickbot.io/schemas/features/credentials'
import { useTranslate } from '@tolgee/react'
import { WorkspaceRole } from '@quickbot.io/prisma'
import { ForgedCredentialsModal } from './ForgedCredentialsModal'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'

const nonEditableTypes = ['whatsApp', 'google sheets'] as const

type Props = Omit<ButtonProps, 'type'> & {
  blockDef?: ForgedBlockDefinition
  onAddClick?: () => void
  type?: Credentials['type']
  workspaceId?: string
  defaultCredentialLabel?: string
  credentialsName?: string
  onCredentialsCreate?: () => void
  onCredentialsDelete?: (credentialId: string) => void
  currentCredentialsId?: string
  onCredentialsSelect: (credentialId?: string) => void
  withClear?: boolean
}

export const ForgedCredentialsDropdown = ({
  currentCredentialsId,
  blockDef,
  onCredentialsSelect,
  onAddClick,
  withClear = true,
  type,
  workspaceId,
  defaultCredentialLabel,
  credentialsName,
  onCredentialsCreate,
  onCredentialsDelete,
  ...props
}: Props) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { showToast } = useToast()
  const { workspace, currentWorkspaceRole } = useWorkspace()
  const trpcContext = trpc.useContext()

  const finalWorkspaceId = workspaceId || workspace?.id
  const finalType = type || (blockDef?.id as Credentials['type'])
  const finalCredentialsName = credentialsName || blockDef?.auth?.name || 'credentials'
  const finalOnCreate = onCredentialsCreate || onAddClick

  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [displayName, setDisplayName] = useState<string | undefined>(undefined)
  const [isDeleting, setIsDeleting] = useState<string>()
  const [editingCredentials, setEditingCredentials] = useState<{
    id: string
    type: Credentials['type']
    initialData?: {
      name?: string
    }
  }>()

  const { data, isLoading: isCredentialsLoading } = trpc.credentials.listCredentials.useQuery(
    {
      workspaceId: finalWorkspaceId as string,
      type: finalType,
    },
    {
      enabled: !!finalWorkspaceId && !!finalType,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const deleteCredentialsMutation = trpc.credentials.deleteCredentials.useMutation({
    onMutate: ({ credentialsId }) => {
      setIsDeleting(credentialsId)
    },
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: async ({ credentialsId }) => {
      // Handle the currently selected credential in the dropdown
      if (credentialsId === currentCredentialsId) onCredentialsSelect(undefined)

      // Call onCredentialsDelete callback if provided (legacy mode)
      if (onCredentialsDelete) {
        onCredentialsDelete(credentialsId)
      }

      // Invalidate cache properly
      await trpcContext.credentials.listCredentials.invalidate()
    },
    onSettled: () => {
      setIsDeleting(undefined)
    },
  })

  const currentCredential = data?.credentials.find((c) => c.id === currentCredentialsId)

  // Update display name when credential changes
  useEffect(() => {
    if (currentCredential?.name) {
      setDisplayName(currentCredential.name)
    } else if (defaultCredentialLabel) {
      setDisplayName(defaultCredentialLabel)
    }
  }, [currentCredential, defaultCredentialLabel])

  const handleMenuItemClick = useCallback(
    (credentialsId: string) => () => {
      setIsLoading(true)
      setLoadingMessage(t('credentials.actions.select'))
      onCredentialsSelect(credentialsId)
      setIsLoading(false)
      setLoadingMessage('')
    },
    [onCredentialsSelect, t],
  )

  const clearQueryParams = useCallback(() => {
    const hasQueryParams = router.asPath.includes('?')
    if (hasQueryParams) router.push(router.asPath.split('?')[0], undefined, { shallow: true })
  }, [router])

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.credentialsId) {
      handleMenuItemClick(router.query.credentialsId.toString())()
      clearQueryParams()
    }
  }, [clearQueryParams, handleMenuItemClick, router.isReady, router.query.credentialsId])

  const deleteCredentials = (credentialsId: string) => async (e: React.MouseEvent) => {
    if (!finalWorkspaceId) return
    e.stopPropagation()
    e.preventDefault()
    deleteCredentialsMutation.mutate({ workspaceId: finalWorkspaceId, credentialsId })
  }

  const handleEditCredentials = (credentialsId: string) => (e: React.MouseEvent) => {
    if (!finalType) return
    e.stopPropagation()
    e.preventDefault()

    // Search credentials
    const credential = data?.credentials.find((c) => c.id === credentialsId)

    setEditingCredentials({
      id: credentialsId,
      type: finalType,
      initialData: {
        name: credential?.name,
      },
    })
  }

  const handleCreateNew = async () => {
    if (!finalOnCreate) return
    setIsLoading(true)
    setLoadingMessage(t('credentials.actions.create'))
    finalOnCreate()
    setIsLoading(false)
    setLoadingMessage('')
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCredentialsSelect(undefined)
  }

  const defaultCredentialsLabel = defaultCredentialLabel ?? `${t('select')} ${finalCredentialsName}`

  let menuButtonContent: React.ReactNode

  if (currentCredential?.name) {
    menuButtonContent = currentCredential.name
  } else if (displayName) {
    menuButtonContent = displayName
  } else if (!isCredentialsLoading && data?.credentials.length === 0 && !defaultCredentialLabel) {
    menuButtonContent = `${t('add')} ${finalCredentialsName}`
  } else if (isCredentialsLoading) {
    menuButtonContent = <Spinner />
  } else {
    menuButtonContent = defaultCredentialsLabel
  }

  // If no credentials exist and no default label, show add button
  if (data?.credentials.length === 0 && !defaultCredentialLabel) {
    return (
      <Button
        variant="outline"
        leftIcon={<PlusIcon />}
        onClick={handleCreateNew}
        isDisabled={currentWorkspaceRole === WorkspaceRole.GUEST}
        isLoading={isLoading}
        loadingText={loadingMessage}
        {...props}
      >
        {t('add')} {finalCredentialsName}
      </Button>
    )
  }

  const getRightIcon = () => {
    if (currentCredential && withClear) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={handleClearSelection}
            icon={<CloseIcon />}
            aria-label="Clear"
            size="xs"
            variant="ghost"
            pointerEvents="all"
            mr={1}
          />
          <ChevronDownIcon />
        </Box>
      )
    }
    return <ChevronDownIcon />
  }

  return (
    <>
      <DropdownMenu
        placement="bottom-end"
        matchWidth={false}
        menuButton={menuButtonContent}
        menuButtonProps={{
          'aria-label': `Select ${finalCredentialsName}`,
          isLoading: isLoading,
          loadingText: loadingMessage,
          rightIcon: getRightIcon(),
          ...props,
        }}
      >
        {defaultCredentialLabel && (
          <MenuItem onClick={handleMenuItemClick('default')}>{defaultCredentialLabel}</MenuItem>
        )}
        {data?.credentials.map((credentials) => (
          <MenuItem
            key={credentials.id}
            onClick={handleMenuItemClick(credentials.id)}
            aria-selected={currentCredentialsId === credentials.id ? 'true' : 'false'}
          >
            <Box w="100%" display="flex" justifyContent="space-between" alignItems="center">
              <Text>{credentials.name}</Text>
              <Spacer />
              <Box ml="30px" display="flex" gap="5px">
                {!nonEditableTypes.includes(
                  credentials.type as (typeof nonEditableTypes)[number],
                ) && (
                    <Box
                      as="span"
                      p="1"
                      cursor="pointer"
                      borderRadius="md"
                      _hover={{ bg: 'gray.100' }}
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      onClick={handleEditCredentials(credentials.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleEditCredentials(credentials.id)(e as unknown as React.MouseEvent)
                        }
                      }}
                      tabIndex={0}
                      aria-label="Edit credential"
                    >
                      <EditIcon color="text.light" />
                    </Box>
                  )}
                <Box
                  as="span"
                  p="1"
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: 'gray.100' }}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    deleteCredentials(credentials.id)(e)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      deleteCredentials(credentials.id)(e as unknown as React.MouseEvent)
                    }
                  }}
                  tabIndex={0}
                  aria-label="Delete credential"
                >
                  {isDeleting === credentials.id ? (
                    <Spinner size="xs" color="text.light" />
                  ) : (
                    <TrashIcon color="text.light" />
                  )}
                </Box>
              </Box>
            </Box>
          </MenuItem>
        ))}
        {currentWorkspaceRole === WorkspaceRole.GUEST ? null : (
          <>
            <MenuDivider />
            <MenuItem icon={<PlusIcon />} onClick={handleCreateNew}>
              {t('blocks.inputs.payment.settings.credentials.connectNew.label')}
            </MenuItem>
          </>
        )}
      </DropdownMenu>
      {editingCredentials && (
        <ForgedCredentialsModal
          mode="update"
          blockDef={forgedBlocks[editingCredentials.type as keyof typeof forgedBlocks] || blockDef}
          credentialsId={editingCredentials.id}
          initialData={editingCredentials.initialData}
          isOpen={true}
          onClose={() => setEditingCredentials(undefined)}
          onUpdate={async () => {
            await trpcContext.credentials.listCredentials.invalidate()
            setEditingCredentials(undefined)
          }}
        />
      )}
    </>
  )
}
