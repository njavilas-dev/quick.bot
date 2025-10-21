import { useEffect, useRef } from 'react'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { useUser } from '@/hooks/useUser'
import { isProduction, isPreview } from '@/lib/env'
import { env } from '@quickbot.io/env'

const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()

  const initializedRef = useRef(false)

  useEffect(() => {
    if (!isProduction() && !isPreview()) return
    if (user?.id) {
      if (!initializedRef.current) {
        try {
          posthog.init(
            env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
            {
              api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
              capture_pageview: false,
              disable_session_recording: true,
              debug: isPreview(),
              capture_exceptions: {
                capture_unhandled_errors: true,
                capture_unhandled_rejections: true,
                capture_console_errors: true,
              },
            }
          )
        } catch (error) {
          console.error('Failed to initialize PostHog', error)
        }
        initializedRef.current = true
      }

      posthog.opt_in_capturing()
      posthog.identify(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
      })
    } else if (initializedRef.current) {
      posthog.reset()
      posthog.opt_out_capturing()
    }
  }, [user?.id, user?.name, user?.email])

  if (!isProduction()) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

export default PostHogProvider
