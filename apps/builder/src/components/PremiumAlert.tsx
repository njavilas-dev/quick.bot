import { Alert, AlertIcon, Button, HStack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { BillingPlanType } from '@quickbot.io/prisma'

interface PremiumAlertProps {
  message: string
  excludedPlans?: BillingPlanType[]
  buttonLabel?: string
}

export const PremiumAlert = ({ message, excludedPlans, buttonLabel }: PremiumAlertProps) => {
  const { t } = useTranslate()

  return (
    <Alert backgroundColor={'alert.premium.bg'} justifyContent="space-between" flexShrink={0}>
      <HStack>
        <AlertIcon color="brand.premium" />
        <Text color="text.premium">{message}</Text>
      </HStack>
      <UpgradePlan
        excludedPlans={excludedPlans}
        trigger={({ onOpen }) => (
          <div style={{ display: 'flex' }}>
            <Button
              variant="premium"
              onClick={onOpen}
              className="premium-upgrade-button"
              sx={{
                backgroundColor: 'brand.premium !important',
                color: 'white !important',
                _hover: {
                  backgroundColor: 'alert.premium.color !important',
                },
                _active: {
                  backgroundColor: 'text.premium !important',
                },
              }}
            >
              {buttonLabel || t('billing.upgradeAlert.buttonDefaultLabel')}
            </Button>
          </div>
        )}
      />
    </Alert>
  )
}
