import { useTranslate } from '@tolgee/react'
import { Button, Link } from '@chakra-ui/react'
import { useSubscription } from '@/hooks/useSubscription'
import { WorkspaceInApp } from '@/hooks/useWorkspace'

type Props = {
  workspace: WorkspaceInApp
}

export const BillingPortalButton = ({ workspace }: Props) => {
  const { t } = useTranslate()
  const { subscriptionData, isLoading } = useSubscription(workspace)
  return (
    <Button
      as={Link}
      href={subscriptionData?.portalUrl}
      isLoading={!isLoading}
      colorScheme="blue"
    >
      {t('billing.billingPortalButton.label')}
    </Button>
  )
}
