import { TRPCError, initTRPC } from '@trpc/server'
import { Context } from './context'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import { ZodError } from 'zod'
import * as Sentry from '@sentry/nextjs'

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      }
    },
  })

const sentryMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
})

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const finalMiddleware = sentryMiddleware.unstable_pipe(isAuthed)

export const router = t.router
export const mergeRouters = t.mergeRouters

export const publicProcedure = t.procedure.use(sentryMiddleware)

export const authenticatedProcedure = t.procedure.use(finalMiddleware)
