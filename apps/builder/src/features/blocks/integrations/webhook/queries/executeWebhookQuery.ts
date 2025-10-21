import { Variable, HttpResponse } from '@quickbot.io/schemas'
import { sendRequest } from '@quickbot.io/lib'

export const executeWebhook = (
  botId: string,
  variables: Variable[],
  { blockId }: { blockId: string },
) =>
  sendRequest<HttpResponse>({
    url: `/api/bots/${botId}/blocks/${blockId}/testWebhook`,
    method: 'POST',
    body: {
      variables,
    },
  })
