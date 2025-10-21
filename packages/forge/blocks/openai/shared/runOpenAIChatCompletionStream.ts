import { APICallError, streamText, ToolCallPart } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { formatStreamPart } from '@ai-sdk/ui-utils'
import { parseTools } from '@quickbot.io/ai/parseTools'
import { parseChatCompletionMessages } from '@quickbot.io/ai/parseChatCompletionMessages'
import { AsyncVariableStore } from '@quickbot.io/forge/types'
import { isModelCompatibleWithVision } from '../helpers/isModelCompatibleWithVision'
import { getValidTemperature } from '../helpers/getValidTemperature'
import { getValidMaxTokens } from '../helpers/getValidMaxTokens'
import { getLastToolResult } from './getLastToolResult'
import { ChatCompletionOptions } from './parseChatCompletionOptions'

type Props = {
  credentials: { apiKey?: string }
  options: ChatCompletionOptions
  variables: AsyncVariableStore
  config: { baseUrl?: string; defaultModel?: string }
  compatibility?: 'strict' | 'compatible'
}

function parseOpenAIError(err: unknown) {
  if (APICallError.isInstance(err)) {
    try {
      const body = err.responseBody && JSON.parse(String(err.responseBody))
      const e = body?.error
      return {
        message: e?.message ?? (err as Error).message,
        code: e?.code,
        param: e?.param,
      }
    } catch (_) { }
  }
  return { message: (err as Error)?.message ?? 'Unknown error' }
}


export const runOpenAIChatCompletionStream = async ({
  credentials: { apiKey },
  options,
  variables,
  config,
  compatibility,
}: Props): Promise<{
  stream?: ReadableStream<Uint8Array>
  httpError?: { status: number; message: string }
}> => {
  if (!apiKey) {
    return { httpError: { status: 401, message: 'API key missing' } }
  }

  const modelName = options.model?.trim() ?? config.defaultModel
  if (!modelName) {
    return { httpError: { status: 400, message: 'model not found' } }
  }

  // Create an OpenAI model instance
  const model = createOpenAI({
    baseURL: options.baseUrl ?? config.baseUrl,
    apiKey,
    compatibility,
  })(modelName)

  // Base configuration for the request (with tool execution support)
  const baseConfig = {
    model,
    temperature: getValidTemperature(modelName, options.temperature),
    tools: parseTools({ tools: options.tools, variables }),
    maxTokens: getValidMaxTokens(modelName, options.maxTokens),
    maxToolRoundtrips: 5, // Allow multiple tool calls
  }

  // Convert user-provided messages into the format the model expects
  const messages = await parseChatCompletionMessages({
    messages: options.messages,
    isVisionEnabled: isModelCompatibleWithVision(modelName),
    shouldDownloadImages: false,
    variables,
  })

  try {
    return {
      stream: new ReadableStream<Uint8Array>({
        async start(controller) {
          const enc = new TextEncoder()
          let finalText = ''
          let promptTokens = 0
          let completionTokens = 0

          let toolCalls: ToolCallPart[] = []

          const cleanup = () => {
            toolCalls = []
            if (global.gc) {
              global.gc()
            }
          }

          (async () => {
            try {

              const result = streamText({ ...baseConfig, messages })

              for await (const part of result.fullStream) {
                switch (part.type) {
                  case 'text-delta': {
                    finalText += part.textDelta
                    controller.enqueue(enc.encode(formatStreamPart('text', part.textDelta)))
                    for (const m of options.responseMapping ?? []) {
                      if (m?.variableId && m.item === 'Message content') {
                        await variables.set(m.variableId, finalText.trim())
                      }
                    }
                    break
                  }
                  case 'tool-call':
                    toolCalls.push(part)
                    break
                  case 'error': {
                    const error = (part as any).error
                    const msg = error?.message ?? 'Stream error'
                    controller.enqueue(enc.encode(formatStreamPart('error', msg)))
                    controller.close()
                    cleanup()
                    return
                  }
                }
              }

              const usage = await result.usage
              if (usage) {
                promptTokens += usage.promptTokens ?? 0
                completionTokens += usage.completionTokens ?? 0
              }

              // Get tool results after stream completes
              const toolResults = await result.toolResults

              controller.enqueue(
                enc.encode(
                  formatStreamPart('finish_message', {
                    finishReason: 'stop',
                    usage: { promptTokens, completionTokens },
                  }),
                ),
              )

              // Final persistence
              for (const m of options.responseMapping ?? []) {
                if (!m?.variableId) continue
                if (m.item === 'Message content' || m.item === undefined) {
                  await variables.save(m.variableId, finalText.trim())
                } else if (m.item === 'Total tokens') {
                  await variables.save(
                    m.variableId,
                    String((usage?.totalTokens ?? promptTokens + completionTokens) || 0),
                  )
                } else if (m.item === 'Tool results') {
                  const last = getLastToolResult(toolResults)
                  await variables.save(m.variableId, last?.result ?? '')
                }
              }

              controller.close()
              cleanup() // Liberate memory
            } catch (err) {

              const { message } = parseOpenAIError(err)

              controller.enqueue(enc.encode(formatStreamPart('error', message)))
              controller.close()
              cleanup()
            }
          })()
        },
      }),
    }
  } catch (err) {

    const { message } = parseOpenAIError(err)

    const statusCode = APICallError.isInstance(err) ? err.statusCode ?? 500 : 500

    return { httpError: { status: statusCode, message } }
  }
}