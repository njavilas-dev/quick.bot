import { useTranslate } from '@tolgee/react'
import { PageNotFound } from '@urbiport/ui'

export default function Custom404() {
  const { t } = useTranslate()

  return (
    <PageNotFound withButton={true} t={t}/>
  )
}


