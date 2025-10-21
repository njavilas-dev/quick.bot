import { LockedIcon, TrashIcon } from '@urbiport/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast } from '@urbiport/ui'
import { Button, HStack, IconButton, Tooltip } from '@chakra-ui/react'
import { BillingPlanType } from '@quickbot.io/prisma'
import { isNotDefined } from '@quickbot.io/lib'
import { useBot } from '@/features/editor/providers/BotProvider'
import { CustomDomainsDropdown } from '@/features/customDomains/components/CustomDomainsDropdown'
import { useTranslate } from '@tolgee/react'
import { env } from '@quickbot.io/env'
import DomainStatusIcon from '@/features/customDomains/components/DomainStatusIcon'
import { InputURL } from '@urbiport/ui'
import UpgradePlan from '@/features/billing/components/UpgradePlan'

export const EditCustomDomain = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { bot, updateBot } = useBot()
  const { showToast } = useToast()

  const customDomain = bot?.customDomain ? bot.customDomain : null
  const existingHost = customDomain ? customDomain?.split('/')[0] : null
  const existingPath = customDomain ? customDomain?.split('/')[1] : null

  const handleDomainChange = (customDomain: string | null) =>
    updateBot({ updates: { customDomain }, save: true })

  const handleDomainPathSave = (newPathname: string) => {
    if (!bot?.customDomain) return
    const newDomain = existingHost + '/' + newPathname
    updateBot({ updates: { customDomain: newDomain }, save: true })
  }

  const handlePublicURLCopy = (newPublicURL: string): void => {
    navigator.clipboard.writeText(newPublicURL)
    showToast({
      detailsTitle: t('toast.details'),
      description: 'Copied to clipboard!',
      status: 'success',
    })
  }

  return (
    <>
      {!!customDomain && (
        <HStack>
          <InputURL
            baseURL={existingHost ? 'https://' + existingHost : ''}
            pathURL={existingPath ?? ''}
            onSave={handleDomainPathSave}
            onCopy={handlePublicURLCopy}
          />
          <IconButton
            icon={<TrashIcon />}
            aria-label="Remove custom domain"
            variant="outline"
            onClick={() => handleDomainChange(null)}
          />
          {workspace?.id && existingHost && (
            <DomainStatusIcon domain={existingHost} workspaceId={workspace.id} />
          )}
        </HStack>
      )}
      {isNotDefined(bot?.customDomain) && env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME ? (
        <>
          {workspace?.billingPlan?.allowCustomDomain ? (
            <CustomDomainsDropdown onCustomDomainSelect={handleDomainChange} />
          ) : (
            <UpgradePlan
              excludedPlans={[BillingPlanType.PERSONAL]}
              trigger={({ onOpen }) => (
                <Tooltip label={t('billing.upgradeLimitLabel', { type: t('billing.limitMessage.customDomain') })}>
                  <Button
                    onClick={onOpen}
                    leftIcon={<LockedIcon />}
                    variant="outline"
                  >
                    Add my domain
                  </Button>
                </Tooltip>
              )}
            />
          )}
        </>
      ) : null}
    </>
  )
}
