import React, { type ReactNode } from 'react'
import { MembersList } from '@/features/workspace/components/MembersList'
import type { NextPageWithLayout } from '@/pages/_app'
import { BoxCard } from '@urbiport/ui'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const MembersWorkspace: NextPageWithLayout = () => {
  return (
    <BoxCard>
      <MembersList />
    </BoxCard>
  )
}

MembersWorkspace.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default MembersWorkspace
