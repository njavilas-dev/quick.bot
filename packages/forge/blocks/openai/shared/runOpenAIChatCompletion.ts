import { APICallError, generateText, ToolResultPart } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { LogsStore, VariableStore } from '@quickbot.io/forge/types'
import { parseChatCompletionMessages } from '@quickbot.io/ai/parseChatCompletionMessages'
import { parseTools } from '@quickbot.io/ai/parseTools'
import { isModelCompatibleWithVision } from '../helpers/isModelCompatibleWithVision'
import { getValidTemperature } from '../helpers/getValidTemperature'
import { getValidMaxTokens } from '../helpers/getValidMaxTokens'
import { getLastToolResult } from './getLastToolResult'
import { ChatCompletionOptions } from './parseChatCompletionOptions'

type OpenAIConfig = {
  baseUrl?: string
  defaultModel?: string
}

type Props = {
  credentials: {
    apiKey?: string
  }
  options: ChatCompletionOptions
  variables: VariableStore
  logs: LogsStore
  config: OpenAIConfig
  compatibility?: 'strict' | 'compatible'
}

export const runOpenAIChatCompletion = async ({
  credentials: { apiKey },
  options,
  variables,
  config: openAIConfig,
  logs,
  compatibility,
}: Props) => {
  if (!apiKey) return logs.add('No API key provided')
  const modelName = options.model?.trim() ?? openAIConfig.defaultModel
  if (!modelName) return logs.add('No model provided')

  // Create an OpenAI model instance
  const model = createOpenAI({
    baseURL: openAIConfig.baseUrl ?? options.baseUrl,
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
    // Call the API synchronously
    const {
      text,
      usage: { totalTokens },
      toolResults,
    } = await generateText({ ...baseConfig, messages })

    // Save variables to persistent storage (DB)
    for (const m of options.responseMapping ?? []) {
      if (!m.variableId) continue
      switch (m.item) {
        case 'Message content':
        case undefined:
          variables.set(m.variableId, text)
          break
        case 'Total tokens':
          variables.set(m.variableId, totalTokens.toString())
          break
        case 'Tool results': {
          const last = getLastToolResult(toolResults)
          variables.set(m.variableId, last?.result ?? '')
          break
        }
      }
    }
  } catch (err) {
    // Error handling for API errors and generic errors
    if (err instanceof APICallError) {
      logs.add({
        status: 'error',
        description: 'An API call error occurred while generating the response',
        details: err.message,
      })
      return
    }
    if (err instanceof Error && err.message) {
      return logs.add({
        status: 'error',
        description: 'An error occurred while generating the response',
        details: err.message,
      })
    }
    logs.add({
      status: 'error',
      description: 'An unknown error occurred while generating the response',
      details: err,
    })
  }
}
