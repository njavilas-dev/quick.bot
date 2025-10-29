import { FolderPage } from '@/features/folders/components/FolderPage'
import type { ReactNode } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

function Page() {
  return <FolderPage />
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
