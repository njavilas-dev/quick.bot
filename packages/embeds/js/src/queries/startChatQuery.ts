import { BotContext } from '@/types'
import { guessApiHost } from '@/utils/guessApiHost'
import { isNotDefined, isNotEmpty } from '@quickbot.io/lib'
import {
  getPaymentInProgressInStorage,
  removePaymentInProgressFromStorage,
} from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import {
  ContinueChatResponse,
  StartChatInput,
  StartChatResponse,
  StartFrom,
  StartPreviewChatInput,
} from '@quickbot.io/schemas'
import ky from 'ky'
import { CorsError } from '@/utils/CorsError'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bot: string | any
  stripeRedirectStatus?: string
  apiHost?: string
  startFrom?: StartFrom
  isPreview: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
  sessionId?: string
}

const getApiURl = ({ apiHost, apiEndpoint }: { apiHost?: string; apiEndpoint: string }) => {
  let url

  url = `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}`

  if (apiEndpoint) {
    url = url + apiEndpoint
  }

  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    process.env.NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET
  ) {
    url =
      url + `?x-vercel-protection-bypass=${process.env.NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET}`
  }

  return url
}

function detectDeviceFromUserAgent(ua: string): 'desktop' | 'tablet' | 'mobile' | 'unknown' {
  const userAgent = (ua || '').toLowerCase()

  const isTablet =
    /ipad|tablet|kindle|silk|playbook/.test(userAgent) ||
    (/android/.test(userAgent) && !/mobile/.test(userAgent))

  const isMobile = /mobi|iphone|ipod|android.*mobile|blackberry|phone|windows phone/.test(userAgent)

  if (isTablet) return 'tablet'
  if (isMobile) return 'mobile'
  if (/macintosh|windows nt|linux|x11|cros/.test(userAgent)) return 'desktop'
  return 'unknown'
}

export async function startChatQuery({
  bot,
  isPreview,
  apiHost,
  prefilledVariables,
  resultId,
  stripeRedirectStatus,
  startFrom,
  sessionId,
}: Props) {
  if (isNotDefined(bot)) throw new Error('Bot ID is required to get initial messages')

  const paymentInProgressStateStr = getPaymentInProgressInStorage() ?? undefined
  const paymentInProgressState = paymentInProgressStateStr
    ? (JSON.parse(paymentInProgressStateStr) as {
        sessionId: string
        bot: BotContext['bot']
      })
    : undefined
  if (paymentInProgressState) {
    removePaymentInProgressFromStorage()

    try {
      const data = await ky
        .post(
          getApiURl({
            apiHost,
            apiEndpoint: `/api/v1/sessions/${paymentInProgressState.sessionId}/continueChat`,
          }),
          {
            json: {
              message: paymentInProgressState
                ? stripeRedirectStatus === 'failed'
                  ? 'fail'
                  : 'Success'
                : undefined,
            },
            timeout: false,
          },
        )
        .json<ContinueChatResponse>()

      return {
        data: {
          ...data,
          ...paymentInProgressState,
        } satisfies StartChatResponse,
      }
    } catch (error) {
      return { error }
    }
  }
  const botId = typeof bot === 'string' ? bot : bot.id
  if (isPreview) {
    try {
      const data = await ky
        .post(
          getApiURl({
            apiHost,
            apiEndpoint: `/api/v1/bots/${botId}/preview/startChat`,
          }),
          {
            json: {
              isStreamEnabled: true,
              startFrom,
              bot,
              prefilledVariables: {
                ...prefilledVariables,
                system_device: detectDeviceFromUserAgent(navigator.userAgent),
                'Device type': detectDeviceFromUserAgent(navigator.userAgent),
              },
              sessionId,
            } satisfies Omit<
              StartPreviewChatInput,
              'botId' | 'isOnlyRegistering' | 'textBubbleContentFormat'
            >,
            timeout: false,
          },
        )
        .json<StartChatResponse>()

      return { data }
    } catch (error) {
      return { error }
    }
  }

  try {
    const iframeReferrerOrigin =
      parent !== window && isNotEmpty(document.referrer)
        ? new URL(document.referrer).origin
        : undefined

    const response = await ky.post(
      getApiURl({
        apiHost,
        apiEndpoint: `/api/v1/bots/${botId}/startChat`,
      }),
      {
        headers: {
          'x-quickbot-iframe-referrer-origin': iframeReferrerOrigin,
        },
        json: {
          isStreamEnabled: true,
          prefilledVariables: {
            ...prefilledVariables,
            system_device: detectDeviceFromUserAgent(navigator.userAgent),
            'Device type': detectDeviceFromUserAgent(navigator.userAgent),
          },
          resultId,
          isOnlyRegistering: false,
        } satisfies Omit<StartChatInput, 'publicId' | 'textBubbleContentFormat'>,
        timeout: false,
      },
    )

    const corsAllowOrigin = response.headers.get('access-control-allow-origin')

    if (
      iframeReferrerOrigin &&
      corsAllowOrigin &&
      corsAllowOrigin !== '*' &&
      !iframeReferrerOrigin.includes(corsAllowOrigin)
    )
      throw new CorsError(corsAllowOrigin)

    return { data: await response.json<StartChatResponse>() }
  } catch (error) {
    return { error }
  }
}
