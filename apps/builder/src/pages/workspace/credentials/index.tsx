import React, { type ReactNode } from 'react'
import { CredentialsSettingsForm } from '@/features/credentials/components/CredentialsSettingsForm'
import type { NextPageWithLayout } from '@/pages/_app'
import Layout from '@/components/layouts/Layout'
import { BoxCard } from '@urbiport/ui'

const CredentialsWorkspace: NextPageWithLayout = () => {
  return (
    <BoxCard>
      <CredentialsSettingsForm />
    </BoxCard>
  )
}

CredentialsWorkspace.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default CredentialsWorkspace
