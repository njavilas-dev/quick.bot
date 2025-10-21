import React from 'react'
import '../styles/globals.css'
import { register } from '../../sentry.server.config'

type Props = {
  Component: React.ComponentType
  pageProps: {
    [key: string]: unknown
  }
}

register()

export default function MyApp({ Component, pageProps }: Props): JSX.Element {
  const { ...componentProps } = pageProps

  return <Component {...componentProps} />
}
