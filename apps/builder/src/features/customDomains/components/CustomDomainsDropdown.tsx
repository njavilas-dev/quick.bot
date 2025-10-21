import {
  IconButton,
  MenuButtonProps,
  MenuItem,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { PlusIcon, TrashIcon, ChevronDownIcon } from '@urbiport/icons'
import { useToast, DropdownMenu } from '@urbiport/ui'
import React, { useState } from 'react'
import { CreateCustomDomainModal } from './CreateCustomDomainModal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'

type Props = Omit<MenuButtonProps, 'type'> & {
  currentCustomDomain?: string
  onCustomDomainSelect: (domain: string) => void
}

export const CustomDomainsDropdown = ({ currentCustomDomain, onCustomDomainSelect }: Props) => {
  const { t } = useTranslate()
  const [isDeleting, setIsDeleting] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  const { data, refetch } = trpc.customDomains.listCustomDomains.useQuery(
    {
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          title: 'Error while fetching custom domains',
          description: error.message,
        })
      },
    },
  )
  const { mutate } = trpc.customDomains.deleteCustomDomain.useMutation({
    onMutate: ({ name }) => {
      setIsDeleting(name)
    },
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        title: 'Error while deleting custom domain',
        description: error.message,
      })
    },
    onSettled: () => {
      setIsDeleting('')
    },
    onSuccess: () => {
      refetch()
    },
  })

  const handleMenuItemClick = (customDomain: string) => () => onCustomDomainSelect(customDomain)

  const handleDeleteDomainClick = (domainName: string) => async (e: React.MouseEvent) => {
    if (!workspace) return
    e.stopPropagation()
    mutate({
      name: domainName,
      workspaceId: workspace.id,
    })
  }

  const handleNewDomain = (name: string) => {
    onCustomDomainSelect(name)
  }

  return (
    <>
      {workspace?.id && (
        <CreateCustomDomainModal
          workspaceId={workspace.id}
          isOpen={isOpen}
          onClose={onClose}
          onNewDomain={handleNewDomain}
        />
      )}
      <DropdownMenu
        menuButton={currentCustomDomain ?? 'Add my domain'}
        menuButtonProps={{
          flexShrink: 0,
          rightIcon: <ChevronDownIcon />,
        }}
      >
        {(data?.customDomains ?? []).map((customDomain) => (
          <MenuItem
            key={customDomain.name}
            onClick={handleMenuItemClick(customDomain.name)}
            aria-selected={currentCustomDomain === customDomain.name ? 'true' : 'false'}
          >
            <>
              <Text noOfLines={1}>{customDomain.name}</Text>
              <Spacer />
              <IconButton
                variant="unstyled"
                icon={<TrashIcon />}
                aria-label="Remove domain"
                size="xs"
                onClick={handleDeleteDomainClick(customDomain.name)}
                isLoading={isDeleting === customDomain.name}
              />
            </>
          </MenuItem>
        ))}
        <MenuItem
          maxW="500px"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          icon={<PlusIcon />}
          onClick={onOpen}
        >
          New Domain
        </MenuItem>
      </DropdownMenu>
    </>
  )
}
