import { env } from '@quickbot.io/env'
import React from 'react'
import { themeClasses } from '../theme'

export const ErrorPage = ({ error }: { error: Error }) => {
  return (
    <div className={themeClasses.error.container}>
      {!env.NEXT_PUBLIC_VIEWER_URL[0] ? (
        <>
          <h1 className={themeClasses.error.title}>NEXT_PUBLIC_VIEWER_URL is missing</h1>
          <h2>
            Make sure to configure the app properly (
            <a href="https://docs.quick.bot/troubleshoot">https://docs.quick.bot/troubleshoot</a>)
          </h2>
        </>
      ) : (
        <p className={themeClasses.error.subtitle}>{error.message}</p>
      )}
    </div>
  )
}
