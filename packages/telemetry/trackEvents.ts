import { env } from '@quickbot.io/env'
import { TelemetryEvent } from '@quickbot.io/schemas/features/telemetry'
import { PostHog } from 'posthog-node'
import ky from 'ky'
import { EVENTS } from './constants'

export const trackEvents = async (events: TelemetryEvent[]) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    return
  }
  try {
    const client = new PostHog(
      env.NEXT_PUBLIC_POSTHOG_KEY,
      {
        host: env.NEXT_PUBLIC_POSTHOG_HOST,
      }
    )

    events.forEach(async (event) => {
      if (!event.userId) return

      client.identify({
        distinctId: event.userId,
        properties: {
          id: event.userId,
          name: (event as any).data?.name,
          email: (event as any).data?.email,
        },
      })

      if (event.name === EVENTS.USER.CREATED) {
        if (env.USER_CREATED_WEBHOOK_URL) {
          try {
            await ky.post(env.USER_CREATED_WEBHOOK_URL, {
              json: {
                email: (event as any).data?.email,
                name: (event as any).data?.name
                  ? (event as any).data.name.split(' ')[0]
                  : undefined,
              },
            })
          } catch (e) {
            console.error('Failed to call user created webhook', e)
          }
        }
      }
      if (
        event.name === EVENTS.WORKSPACE.CREATED ||
        event.name === EVENTS.WORKSPACE.SUBSCRIPTION_UPDATED
      ) {
        client.groupIdentify({
          groupType: 'workspace',
          groupKey: (event as any).workspaceId,
          properties: (event as any).data,
        })
      }
      if (
        event.name === EVENTS.BOT.CREATED ||
        event.name === EVENTS.BOT.PUBLISHED ||
        event.name === EVENTS.BOT.DELETED
      ) {
        client.groupIdentify({
          groupType: 'bot',
          groupKey: (event as any).botId,
          properties: { name: (event as any).data.name },
        })
      }
      const groups: { workspace?: string; bot?: string } = {}
      if ('workspaceId' in event) groups['workspace'] = event.workspaceId
      if ('botId' in event) groups['bot'] = event.botId
      client.capture({
        distinctId: event.userId,
        event: event.name,
        properties:
          event.name === EVENTS.USER.UPDATED
            ? { $set: event.data }
            : event.name === EVENTS.USER.LOGGED_IN
              ? {
                $set: {
                  lastActivityAt: new Date().toISOString(),
                },
              }
              : 'data' in event
                ? event.data
                : undefined,
        groups,
      })
    })

    await client.shutdownAsync()
  } catch (error) {
    console.error('Failed to track events', error)
  }
}
