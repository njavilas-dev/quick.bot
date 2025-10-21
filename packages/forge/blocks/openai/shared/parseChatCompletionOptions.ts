import { option } from '@quickbot.io/forge'
import { z } from '@quickbot.io/forge/zod'
import { baseOptions } from '../baseOptions'
import { toolsSchema } from '@quickbot.io/ai/schemas'

const nativeMessageContentSchema = {
  content: option.string.layout({
    inputType: 'textarea',
    placeholder: 'Content',
    withVariableButton: true,
  }),
}

const systemMessageItemSchema = option
  .object({
    role: option.literal('system'),
  })
  .extend(nativeMessageContentSchema)

const userMessageItemSchema = option
  .object({
    role: option.literal('user'),
  })
  .extend(nativeMessageContentSchema)

const assistantMessageItemSchema = option
  .object({
    role: option.literal('assistant'),
  })
  .extend(nativeMessageContentSchema)

const dialogueMessageItemSchema = option.object({
  role: option.literal('Dialogue'),
  dialogueVariableId: option.string.layout({
    inputType: 'variableDropdown',
    placeholder: 'Dialogue variable',
  }),
  startsBy: option.enum(['user', 'assistant']).default('user').openapi({ type: 'string' }).layout({
    isRequired: true,
    label: 'starts by',
    direction: 'row',
  }),
})

type Props = {
  defaultTemperature: number
  modelFetchId?: string
  modelHelperText?: string
  maxTokens?: number
}

export const parseChatCompletionOptions = ({
  defaultTemperature,
  modelFetchId,
  modelHelperText,
  maxTokens = 2048,
}: Props) =>
  option.object({
    model: option.string.layout({
      placeholder: modelFetchId ? 'Select a model' : undefined,
      label: modelFetchId ? undefined : 'Model',
      fetcher: modelFetchId,
      helperText: modelHelperText,
      isRequired: true,
    }),
    messages: option
      .array(
        option.discriminatedUnion('role', [
          systemMessageItemSchema,
          userMessageItemSchema,
          assistantMessageItemSchema,
          dialogueMessageItemSchema,
        ]),
      )
      .layout({ accordion: 'Messages', itemLabel: 'message', isOrdered: true }),
    tools: toolsSchema,
    temperature: option.number.min(0).max(2).layout({
      accordion: 'Settings',
      label: 'Temperature',
      direction: 'row',
      defaultValue: defaultTemperature,
    }),
    maxTokens: option.number.min(1).max(4096).layout({
      accordion: 'Settings',
      label: 'Max Tokens',
      direction: 'row',
      defaultValue: maxTokens,
    }),
    responseMapping: option.saveResponseArray(['Message content', 'Total tokens', 'Tool results'] as const).layout({
      accordion: 'Response',
    }),
  })

export type ChatCompletionOptions = z.infer<ReturnType<typeof parseChatCompletionOptions>> &
  z.infer<typeof baseOptions>
