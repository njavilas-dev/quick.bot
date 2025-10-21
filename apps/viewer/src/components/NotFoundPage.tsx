import { env } from '@quickbot.io/env'
import { themeClasses } from '../theme'

export const NotFoundPage = () => {
  return (
    <div className={themeClasses.notFound.container}>
      <h1 className={themeClasses.notFound.title}>{env.NEXT_PUBLIC_VIEWER_404_TITLE}</h1>
      <h2 className={themeClasses.notFound.subtitle}>{env.NEXT_PUBLIC_VIEWER_404_SUBTITLE}</h2>
    </div>
  )
}
