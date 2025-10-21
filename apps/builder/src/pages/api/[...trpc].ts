import cors from 'nextjs-cors'
import { createOpenApiNextHandler } from '@lilyrose2798/trpc-openapi'
import { NextApiRequest, NextApiResponse } from 'next'
import * as Sentry from '@sentry/nextjs'
import { createContext } from '@/helpers/server/context'
import { publicRouter } from '@/helpers/server/routers/publicRouter'
import { env } from "@quickbot.io/env"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res, {
    origin: [
      'https://docs.quick.bot',
      env.NEXTAUTH_URL,
    ],
  })

  return createOpenApiNextHandler({
    router: publicRouter,
    createContext,
    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        Sentry.captureException(error)
        console.error('Something went wrong', error)
      }
    },
  })(req, res)
}

export default handler
