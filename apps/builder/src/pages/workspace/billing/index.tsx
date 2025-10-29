import React, { ReactNode, useState } from 'react'
import { Button, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { BoxCard, H2 } from '@urbiport/ui'
import type { NextPageWithLayout } from '@/pages/_app'
import BillingHeader from '@/features/billing/components/BillingHeader'
import { InvoicesList } from '@/features/billing/components/InvoicesList'
import BillingInfo from '@/features/billing/components/BillingInfo'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const BillingWorkspace: NextPageWithLayout = () => {
  const { t } = useTranslate()
  const [currentTab, setCurrentTab] = useState<'billing' | 'invoices'>('billing')
  const { workspace } = useWorkspace()
  const { isAdmin } = useWorkspaceRole()

  return (
    <BoxCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <H2>Billing</H2>
        <Stack direction="row" spacing="8px">
          {isAdmin && workspace?.stripeId && (
            <Button
              isActive={currentTab === 'invoices'}
              variant="ghost:link"
              textTransform="uppercase"
              onClick={() => setCurrentTab('invoices')}
            >
              {t('billing.invoices.label')}
            </Button>
          )}
          <Button
            isActive={currentTab === 'billing'}
            variant="ghost:link"
            textTransform="uppercase"
            onClick={() => setCurrentTab('billing')}
          >
            {t('billing.information.label')}
          </Button>
          {isAdmin && (
            <UpgradePlan
              trigger={({ onOpen }) => (
                <Button textTransform="uppercase" onClick={onOpen}>
                  {t('billing.upgradePlan.label')}
                </Button>
              )}
            />
          )}
        </Stack>
      </Stack>
      <BillingHeader />
      {currentTab === 'billing' ? <BillingInfo /> : <InvoicesList />}
    </BoxCard>
  )
}

BillingWorkspace.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default BillingWorkspace
