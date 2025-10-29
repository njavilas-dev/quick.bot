import React, { type ReactNode } from 'react'
import { CredentialsSettingsForm } from '@/features/credentials/components/CredentialsSettingsForm'
import type { NextPageWithLayout } from '@/pages/_app'
import { BoxCard } from '@urbiport/ui'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const CredentialsWorkspace: NextPageWithLayout = () => {
  return (
    <BoxCard>
      <CredentialsSettingsForm />
    </BoxCard>
  )
}

CredentialsWorkspace.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default CredentialsWorkspace
