import { CloseIcon } from '@urbiport/icons'
import { trpc } from '@/lib/trpc'
import { useToast } from '@urbiport/ui'
import { Spinner, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'
import { CustomDomainConfigModal } from './CustomDomainConfigModal'
import { useTranslate } from '@tolgee/react'

type Props = {
  domain: string
  workspaceId: string
}
export default function DomainStatusIcon({ domain, workspaceId }: Props) {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { showToast } = useToast()
  const { data, isLoading } = trpc.customDomains.verifyCustomDomain.useQuery(
    {
      name: domain,
      workspaceId,
    },
    {
      enabled: !!domain && !!workspaceId,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
        })
      },
    },
  )

  return (
    <>
      <Tooltip label={data?.status}>
        <IconButton
          icon={isLoading ? <Spinner /> : <CloseIcon stroke="alert.error.color" />}
          aria-label={data?.status || ''}
          variant="outline"
          cursor="pointer"
          onClick={onOpen}
          isDisabled={isLoading}
        />
      </Tooltip>
      <CustomDomainConfigModal
        workspaceId={workspaceId}
        isOpen={isOpen}
        domain={domain}
        onClose={onClose}
      />
    </>
  )
}
