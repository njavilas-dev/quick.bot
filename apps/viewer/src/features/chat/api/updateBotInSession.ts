import { publicProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { updateBotInSession as updateBotInSessionFn } from '@quickbot.io/bot-engine/apiHandlers/updateBotInSession'

export const updateBotInSession = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/sessions/{sessionId}/updateBot',
      summary: 'Update bot in session',
      description:
        'Update chat session with latest bot modifications. This is useful when you want to update the bot in an ongoing session after making changes to it.',
      protect: true,
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
    }),
  )
  .output(z.object({ message: z.literal('success') }))
  .mutation(({ input: { sessionId }, ctx: { user } }) => updateBotInSessionFn({ user, sessionId }))
