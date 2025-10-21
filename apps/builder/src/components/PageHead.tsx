import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

const PageHead = () => {
  const router = useRouter()

  const { asPath } = router

  const formattedPathname = asPath
    .split('/')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' / ')

  return (
    <Head>
      <title>{`QuickBot / ${formattedPathname}`}</title>
    </Head>
  )
}

export default PageHead
