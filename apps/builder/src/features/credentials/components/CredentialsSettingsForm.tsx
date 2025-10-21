import { trpc } from '@/lib/trpc'
import {
  HStack,
  Stack,
  IconButton,
  Divider,
  Button,
  MenuItem,
  IconProps,
  TextProps,
  Box,
  Tr,
  Td,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Th,
} from '@chakra-ui/react'
import { DropdownMenu, useToast } from '@urbiport/ui'
import React, { useEffect, useMemo, useState } from 'react'
import { Credentials, credentialsTypes } from '@quickbot.io/schemas'
import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { BlockLabel } from '@/features/editor/components/BlockLabel'
import { Text } from '@chakra-ui/react'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { StripeLogo } from '@urbiport/icons'
import { ChevronDownIcon, EditIcon, TrashIcon } from '@urbiport/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole'
import { ForgedCredentialsModal } from '@/features/forge/components/credentials/ForgedCredentialsModal'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { StripeCreateModalContent } from '@/features/blocks/integrations/payment/components/StripeConfigModal'
import { GoogleSheetConnectModalContent } from '@/features/blocks/integrations/googleSheets/components/GoogleSheetsConnectModal'
import { SmtpCreateModalContent } from '@/features/blocks/integrations/sendEmail/components/SmtpConfigModal'
import { UpdateStripeCredentialsModalContent } from '@/features/blocks/integrations/payment/components/UpdateStripeCredentialsModalContent'
import { SmtpUpdateModalContent } from '@/features/blocks/integrations/sendEmail/components/SmtpUpdateModalContent'
import { Modal, ModalOverlay } from '@chakra-ui/react'
import { H2 } from '@urbiport/ui'
import { TableSkeleton } from '@/components/TableSkeleton'
import { useLoadingSave } from '@/hooks/useLoadingSave'

const nonEditableTypes = ['google sheets'] as const

type CredentialsInfo = Pick<Credentials, 'id' | 'type' | 'name'>

const isForgedBlockType = (type: Credentials['type']): boolean => {
  return type in forgedBlocks
}

export const CredentialsSettingsForm = () => {
  const setLoadingSave = useLoadingSave()
  const { showToast } = useToast()
  const [creatingType, setCreatingType] = useState<Credentials['type']>()
  const [editingCredentials, setEditingCredentials] = useState<{
    id: string
    type: Credentials['type']
  }>()
  const [deletingCredentialsId, setDeletingCredentialsId] = useState<string>()
  const { workspace } = useWorkspace()
  const { isAdmin } = useWorkspaceRole()
  const { data, isLoading, refetch } = trpc.credentials.listCredentials.useQuery(
    {
      workspaceId: workspace?.id ?? '',
    },
    {
      enabled: !!workspace?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const { mutate: deleteCredentials, isLoading: isDeletingCredentials } = trpc.credentials.deleteCredentials.useMutation({
    onMutate: ({ credentialsId }) => setDeletingCredentialsId(credentialsId as string),
    onSettled: () => {
      setDeletingCredentialsId(undefined)
    },
    onError: (error) => {
      showToast({
        title: 'Failed to delete credentials',
        description: error.message,
        status: 'error',
      })
    },
    onSuccess: () => {
      refetch()
    },
  })

  useEffect(() => {
    if (isDeletingCredentials) {
      setLoadingSave()
    }
  }, [isDeletingCredentials, setLoadingSave])

  const credentials = useMemo(
    () => (data?.credentials ? groupCredentialsByType(data.credentials) : undefined),
    [data?.credentials],
  )

  return (
    <Stack spacing="6" w="full">
      {/* Handle forged block credentials */}
      {creatingType && isForgedBlockType(creatingType) && (
        <ForgedCredentialsModal
          mode="create"
          blockDef={forgedBlocks[creatingType as keyof typeof forgedBlocks]}
          isOpen={true}
          onClose={() => setCreatingType(undefined)}
          onNewCredentials={() => {
            refetch()
            setCreatingType(undefined)
          }}
        />
      )}
      {editingCredentials && isForgedBlockType(editingCredentials.type) && (
        <ForgedCredentialsModal
          mode="update"
          blockDef={forgedBlocks[editingCredentials.type as keyof typeof forgedBlocks]}
          credentialsId={editingCredentials.id}
          isOpen={true}
          onClose={() => setEditingCredentials(undefined)}
          onUpdate={() => {
            refetch()
            setEditingCredentials(undefined)
          }}
        />
      )}

      {/* Handle special case credentials */}
      {creatingType && !isForgedBlockType(creatingType) && (
        <Modal
          isOpen={true}
          onClose={() => setCreatingType(undefined)}
          size="lg"
        >
          <ModalOverlay />
          {(() => {
            switch (creatingType) {
              case 'google sheets':
                return <GoogleSheetConnectModalContent />
              case 'smtp':
                return <SmtpCreateModalContent onNewCredentials={() => {
                  refetch()
                  setCreatingType(undefined)
                }} />
              case 'stripe':
                return <StripeCreateModalContent
                  onNewCredentials={() => {
                    refetch()
                    setCreatingType(undefined)
                  }}
                  onClose={() => setCreatingType(undefined)}
                />
              default:
                return null
            }
          })()}
        </Modal>
      )}

      {editingCredentials && !isForgedBlockType(editingCredentials.type) && (
        <Modal isOpen={true} onClose={() => setEditingCredentials(undefined)}>
          <ModalOverlay />
          {(() => {
            switch (editingCredentials.type) {
              case 'google sheets':
                return null
              case 'smtp':
                return <SmtpUpdateModalContent
                  credentialsId={editingCredentials.id}
                  onUpdate={() => {
                    refetch()
                    setEditingCredentials(undefined)
                  }}
                />
              case 'stripe':
                return <UpdateStripeCredentialsModalContent
                  credentialsId={editingCredentials.id}
                  onUpdate={() => {
                    refetch()
                    setEditingCredentials(undefined)
                  }}
                />
              default:
                return null
            }
          })()}
        </Modal>
      )}
      <HStack justifyContent="space-between">
        <Box display="flex" flexDirection="column" gap="8px">
          <H2>Credentials</H2>
          <Text fontSize="sm" color="text.light">
            Setup your workspace integration credentials.
          </Text>
        </Box>
        {isAdmin && (
          <DropdownMenu
            menuButton="Create new"
            menuButtonProps={{
              rightIcon: <ChevronDownIcon />,
            }}
          >
            {credentialsTypes
              .filter((type) => type !== 'whatsApp') // WhatsApp requires bot context, not available at workspace level
              .map((type) => (
              <MenuItem
                key={type}
                icon={<CredentialsIcon type={type} />}
                onClick={() => setCreatingType(type)}
              >
                <CredentialsLabel type={type} />
              </MenuItem>
              ))}
          </DropdownMenu>
        )}
      </HStack>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!isLoading &&
              credentials &&
              Object.keys(credentials).length > 0 &&
              (Object.keys(credentials) as Credentials['type'][]).map((type) => {
                return credentials?.[type].map((cred) => {
                  return (
                    <Tr key={type}>
                      <Td>
                        <CredentialsIcon type={type} boxSize="24px" />
                      </Td>
                      <Td>
                        <CredentialsLabel type={type} fontWeight="semibold" />
                      </Td>
                      <Td>
                        <CredentialsItem
                          type={cred.type}
                          name={cred.name}
                          isDeleting={deletingCredentialsId === cred.id}
                          canEdit={isAdmin}
                          onEditClick={
                            nonEditableTypes.includes(
                              cred.type as (typeof nonEditableTypes)[number],
                            )
                              ? undefined
                              : () =>
                                setEditingCredentials({
                                  id: cred.id,
                                  type: cred.type,
                                })
                          }
                          onDeleteClick={() =>
                            deleteCredentials({
                              workspaceId: workspace?.id ?? '',
                              credentialsId: cred.id,
                            })
                          }
                        />
                      </Td>
                    </Tr>
                  )
                })
              })}
            {isLoading && <TableSkeleton columns={3} />}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

const CredentialsIcon = ({ type, ...props }: { type: Credentials['type'] } & IconProps) => {
  switch (type) {
    case 'google sheets':
      return <BlockIcon type={IntegrationBlockType.GOOGLE_SHEETS} {...props} />
    case 'smtp':
      return <BlockIcon type={IntegrationBlockType.EMAIL} {...props} />
    case 'stripe':
      return <StripeLogo borderRadius="sm" {...props} />
    case 'whatsApp':
      return null // WhatsApp not available at workspace level
    default:
      return <BlockIcon type={type} {...props} />
  }
}

const CredentialsLabel = ({ type, ...props }: { type: Credentials['type'] } & TextProps) => {
  switch (type) {
    case 'google sheets':
      return (
        <Text fontSize="sm" {...props}>
          Google Sheets
        </Text>
      )
    case 'smtp':
      return (
        <Text fontSize="sm" {...props}>
          SMTP
        </Text>
      )
    case 'stripe':
      return (
        <Text fontSize="sm" {...props}>
          Stripe
        </Text>
      )
    case 'whatsApp':
      return null // WhatsApp not available at workspace level
    default:
      return <BlockLabel type={type} {...props} />
  }
}

const CredentialsItem = ({
  isDeleting,
  canEdit,
  onEditClick,
  onDeleteClick,
  ...cred
}: Pick<Credentials, 'name' | 'type'> & {
  isDeleting: boolean
  canEdit: boolean
  onEditClick?: () => void
  onDeleteClick: () => void
}) => {
  return (
    <HStack justifyContent="space-between" py="2">
      <Text fontSize="sm">{cred.name}</Text>
      {canEdit && (
        <HStack>
          {onEditClick && (
            <IconButton
              aria-label="Edit"
              size="xs"
              onClick={onEditClick}
              icon={<EditIcon size="xs" />}
            />
          )}
          <DropdownMenu
            placement="bottom-end"
            matchWidth={false}
            menuButtonProps={{
              as: IconButton,
              size: 'xs',
              variant: 'outline',
              justifyContent: 'center',
              alignItems: 'center',
              icon: <TrashIcon />,
              'aria-label': 'Delete',
            }}
          >
            <Box>
              <Text fontSize="sm" fontWeight="semibold">
                Are you sure?
              </Text>
              <Text fontSize="sm">
                Make sure this credentials is not used in any of your published bot before proceeding.
              </Text>
            </Box>
            <Divider mt={2} mb={2} />
            <HStack>
              <Button onClick={onDeleteClick} isLoading={isDeleting} size="sm">
                Delete
              </Button>
            </HStack>
          </DropdownMenu>
        </HStack>
      )}
    </HStack>
  )
}

const groupCredentialsByType = (
  credentials: CredentialsInfo[],
): Record<CredentialsInfo['type'], CredentialsInfo[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedCredentials: any = {}
  credentials.forEach((cred) => {
    if (!groupedCredentials[cred.type]) {
      groupedCredentials[cred.type] = []
    }
    groupedCredentials[cred.type].push(cred)
  })
  return groupedCredentials
}
