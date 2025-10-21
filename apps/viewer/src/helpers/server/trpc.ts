import { initTRPC } from '@trpc/server'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import { Context } from './context'
import * as Sentry from '@sentry/nextjs'

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson,
})

const sentryMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
})
const injectUser = t.middleware(({ next, ctx }) => {
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const finalMiddleware = sentryMiddleware.unstable_pipe(injectUser)

export const router = t.router

export const publicProcedure = t.procedure.use(finalMiddleware)
