import React, { type ReactNode } from 'react'
import { MembersList } from '@/features/workspace/components/MembersList'
import Layout from '@/components/layouts/Layout'
import type { NextPageWithLayout } from '@/pages/_app'
import { BoxCard } from '@urbiport/ui'

const MembersWorkspace: NextPageWithLayout = () => {
  return (
      <BoxCard>
      <MembersList />
    </BoxCard>
  )
}

MembersWorkspace.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>
}

export default MembersWorkspace
