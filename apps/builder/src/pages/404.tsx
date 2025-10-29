import { useTranslate } from '@tolgee/react'
import { PageNotFound } from '@urbiport/ui'
import { AccountLayout } from '@/components/layouts/AccountLayout'
import type { ReactNode } from 'react'

export default function Custom404() {
  const { t } = useTranslate()

  return <PageNotFound withButton={true} t={t} />
}

Custom404.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}
