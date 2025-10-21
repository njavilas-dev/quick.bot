import {
  Answer,
  SessionState,
  SetVariableBlock,
  SetVariableHistoryItem,
  Variable,
  VariableWithUnknowValue,
  VariableWithValue,
} from '@quickbot.io/schemas'
import { byId, isEmpty, isNotDefined } from '@quickbot.io/lib'
import { ExecuteLogicResponse } from '../../../types'
import { parseScriptToExecuteClientSideAction } from '../script/executeScript'
import { parseVariables } from '@quickbot.io/variables/parseVariables'
import { getUpdatedVariablesInSession } from '@quickbot.io/variables/getUpdatedVariablesInSession'
import { createId } from '@quickbot.io/lib/createId'
import { utcToZonedTime, format as tzFormat } from 'date-fns-tz'
import {
  computeResultTranscript,
  parseTranscriptMessageText,
} from '@quickbot.io/logic/computeResultTranscript'
import prisma from '@quickbot.io/lib/prisma'
import {
  defaultSetVariableOptions,
  sessionOnlySetVariableOptions,
} from '@quickbot.io/schemas/features/blocks/logic/setVariable/constants'
import { createCodeRunner } from '@quickbot.io/variables/codeRunners'
import { stringifyError } from '@quickbot.io/lib/stringifyError'

export const executeSetVariable = async (
  state: SessionState,
  block: SetVariableBlock,
  setVariableHistory: SetVariableHistoryItem[],
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.botsQueue[0].bot
  if (!block.options?.variableId)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
    }

  const expressionToEvaluate = await getExpressionToEvaluate(state)(
    block.options,
    block.id,
    setVariableHistory,
  )
  const isCode =
    (!block.options.type || block.options.type === 'Custom') &&
    (block.options.isCode ?? defaultSetVariableOptions.isCode)
  if (
    expressionToEvaluate &&
    expressionToEvaluate.type === 'code' &&
    !state.whatsApp &&
    (block.options.isExecutedOnClient || block.options.type === 'Moment of the day')
  ) {
    const scriptToExecute = parseScriptToExecuteClientSideAction(
      variables,
      expressionToEvaluate.code,
    )
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          type: 'setVariable',
          setVariable: {
            scriptToExecute: {
              ...scriptToExecute,
              isCode,
            },
          },
          expectsDedicatedReply: true,
        },
      ],
    }
  }
  const { value, error } =
    (expressionToEvaluate
      ? evaluateSetVariableExpression(variables)(expressionToEvaluate)
      : undefined) ?? {}
  const existingVariable = variables.find(byId(block.options.variableId))
  if (!existingVariable) return { outgoingEdgeId: block.outgoingEdgeId }
  const newVariable = {
    ...existingVariable,
    value,
  }
  const { newSetVariableHistory, updatedState } = getUpdatedVariablesInSession({
    state,
    newVariables: [
      ...parseColateralVariableChangeIfAny({ state, options: block.options }),
      {
        ...newVariable,
        isSavedVariable: sessionOnlySetVariableOptions.includes(
          block.options.type as (typeof sessionOnlySetVariableOptions)[number],
        )
          ? true
          : newVariable.isSavedVariable,
      },
    ],
    currentBlockId: block.id,
  })

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    newSessionState: updatedState,
    newSetVariableHistory,
    logs:
      error && isCode
        ? [
          {
            status: 'error',
            description: 'Error evaluating Set variable code',
            details: error,
          },
        ]
        : undefined,
  }
}

const evaluateSetVariableExpression =
  (variables: Variable[]) =>
    (
      expression:
        | {
          type: 'code'
          code: string
        }
        | { type: 'value'; value: VariableWithValue['value'] },
    ): { value: unknown; error?: string } => {
      if (expression.type === 'value') return { value: expression.value }
      const isSingleVariable =
        expression.code.startsWith('{{') &&
        expression.code.endsWith('}}') &&
        expression.code.split('{{').length === 2
      if (isSingleVariable) return { value: parseVariables(variables)(expression.code) }
      // To avoid octal number evaluation
      if (!isNaN(expression.code as unknown as number) && /0[^.].+/.test(expression.code))
        return { value: expression.code }
      try {
        const body = parseVariables(variables, { fieldToParse: 'id' })(expression.code)
        return {
          value: createCodeRunner({ variables })(body.includes('return ') ? body : `return ${body}`),
        }
      } catch (err) {
        return {
          value: parseVariables(variables)(expression.code),
          error: stringifyError(err),
        }
      }
    }

const getExpressionToEvaluate =
  (state: SessionState) =>
    async (
      options: SetVariableBlock['options'],
      blockId: string,
      setVariableHistory: SetVariableHistoryItem[],
    ): Promise<
      { type: 'code'; code: string } | { type: 'value'; value: VariableWithValue['value'] } | null
    > => {
      switch (options?.type) {
        case 'Contact name':
          return state.whatsApp?.contact.name
            ? { type: 'value', value: state.whatsApp.contact.name }
            : null
        case 'Phone number': {
          return state.whatsApp?.contact.phoneNumber
            ? { type: 'value', value: state.whatsApp.contact.phoneNumber }
            : null
        }
        case 'Now': {
          const timeZone = parseVariables(state.botsQueue[0].bot.variables)(options.timeZone)
          if (isEmpty(timeZone)) return { type: 'value', value: new Date().toISOString() }
          return { type: 'value', value: toISOWithTz(new Date(), timeZone) }
        }

        case 'Today':
          return { type: 'value', value: new Date().toISOString() }
        case 'Tomorrow': {
          const timeZone = parseVariables(state.botsQueue[0].bot.variables)(options.timeZone)
          if (isEmpty(timeZone))
            return {
              type: 'value',
              value: new Date(Date.now() + 86400000).toISOString(),
            }
          return {
            type: 'value',
            value: toISOWithTz(new Date(Date.now() + 86400000), timeZone),
          }
        }
        case 'Yesterday': {
          const timeZone = parseVariables(state.botsQueue[0].bot.variables)(options.timeZone)
          if (isEmpty(timeZone))
            return {
              type: 'value',
              value: new Date(Date.now() - 86400000).toISOString(),
            }
          return {
            type: 'value',
            value: toISOWithTz(new Date(Date.now() - 86400000), timeZone),
          }
        }
        case 'Random ID': {
          return { type: 'value', value: createId() }
        }
        case 'Result ID':
        case 'User ID': {
          return {
            type: 'value',
            value: state.botsQueue[0].resultId ?? createId(),
          }
        }
        case 'Map item with same index': {
          const baseListVariableValue = state.botsQueue[0].bot.variables.find(
            byId(options.mapListItemParams?.baseListVariableId),
          )?.value
          const baseItemVariableValue = state.botsQueue[0].bot.variables.find(
            byId(options.mapListItemParams?.baseItemVariableId),
          )?.value
          const targetListVariableValue = state.botsQueue[0].bot.variables.find(
            byId(options.mapListItemParams?.targetListVariableId),
          )?.value

          if (
            !Array.isArray(baseListVariableValue) ||
            !baseItemVariableValue ||
            typeof baseItemVariableValue !== 'string'
          )
            return null
          const itemIndex = baseListVariableValue.indexOf(baseItemVariableValue)
          if (itemIndex === -1 || !Array.isArray(targetListVariableValue)) return null
          const value = targetListVariableValue.at(itemIndex)
          if (isEmpty(value)) return null
          return {
            type: 'value',
            value,
          }
        }
        case 'Pop': {
          const variableValue = state.botsQueue[0].bot.variables.find(byId(options.variableId))?.value
          if (isNotDefined(variableValue)) return null
          if (!Array.isArray(variableValue))
            return {
              type: 'value',
              value: variableValue,
            }
          return {
            type: 'value',
            value: variableValue.slice(0, -1),
          }
        }
        case 'Shift': {
          const variableValue = state.botsQueue[0].bot.variables.find(byId(options.variableId))?.value
          if (isNotDefined(variableValue)) return null
          if (!Array.isArray(variableValue))
            return {
              type: 'value',
              value: variableValue,
            }
          return {
            type: 'value',
            value: variableValue.slice(1),
          }
        }
        case 'Append value(s)': {
          if (!options.variableId) return null
          const item = parseVariables(state.botsQueue[0].bot.variables)(options.item)
          const variableValue = state.botsQueue[0].bot.variables.find(byId(options.variableId))?.value
          if (isNotDefined(variableValue))
            return {
              type: 'value',
              value: [item],
            }
          if (!Array.isArray(variableValue)) return { type: 'value', value: [variableValue, item] }
          return { type: 'value', value: variableValue.concat(item) }
        }
        case 'Empty': {
          return null
        }
        case 'Moment of the day': {
          return {
            type: 'code',
            code: `const now = new Date()
        if(now.getHours() < 12) return 'morning'
        if(now.getHours() >= 12 && now.getHours() < 18) return 'afternoon'
        if(now.getHours() >= 18) return 'evening'
        if(now.getHours() >= 22 || now.getHours() < 6) return 'night'`,
          }
        }
        case 'Environment name': {
          return {
            type: 'value',
            value: state.whatsApp ? 'whatsapp' : 'web',
          }
        }
        case 'Transcript': {
          const props = await parseTranscriptProps(state)
          if (!props) return null
          const botWithEmptyVariables = {
            ...state.botsQueue[0].bot,
            variables: state.botsQueue[0].bot.variables.map((v) => ({
              ...v,
              value: undefined,
            })),
          }
          const transcript = computeResultTranscript({
            bot: botWithEmptyVariables,
            stopAtBlockId: blockId,
            ...props,
            setVariableHistory: props.setVariableHistory.concat(setVariableHistory),
          })
          return {
            type: 'value',
            value: transcript
              .map(
                (message) =>
                  `${message.role === 'bot' ? 'Assistant:' : 'User:'} "${parseTranscriptMessageText(
                    message,
                  )}"`,
              )
              .join('\n\n'),
          }
        }
        case 'Custom':
        case undefined: {
          return options?.expressionToEvaluate
            ? { type: 'code', code: options.expressionToEvaluate }
            : null
        }
      }
    }

const toISOWithTz = (date: Date, timeZone: string) => {
  const zonedDate = utcToZonedTime(date, timeZone)
  return tzFormat(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone })
}

type ParsedTranscriptProps = {
  answers: Pick<Answer, 'blockId' | 'content' | 'attachedFileUrls'>[]
  setVariableHistory: Pick<SetVariableHistoryItem, 'blockId' | 'variableId' | 'value'>[]
  visitedEdges: string[]
}

const parseTranscriptProps = async (
  state: SessionState,
): Promise<ParsedTranscriptProps | undefined> => {
  if (!state.botsQueue[0].resultId) return parsePreviewTranscriptProps(state)
  return parseResultTranscriptProps(state)
}

const parsePreviewTranscriptProps = async (
  state: SessionState,
): Promise<ParsedTranscriptProps | undefined> => {
  if (!state.previewMetadata) return
  return {
    answers: state.previewMetadata.answers ?? [],
    setVariableHistory: state.previewMetadata.setVariableHistory ?? [],
    visitedEdges: state.previewMetadata.visitedEdges ?? [],
  }
}

type UnifiedAnswersFromDB = (ParsedTranscriptProps['answers'][number] & {
  createdAt: Date
})[]

const parseResultTranscriptProps = async (
  state: SessionState,
): Promise<ParsedTranscriptProps | undefined> => {
  const result = await prisma.botResult.findUnique({
    where: {
      id: state.botsQueue[0].resultId,
    },
    select: {
      edges: {
        select: {
          edgeId: true,
          index: true,
        },
      },
      answersV2: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
          attachedFileUrls: true,
        },
      },
      setVariableHistory: {
        select: {
          blockId: true,
          variableId: true,
          index: true,
          value: true,
        },
      },
    },
  })
  if (!result) return
  return {
    answers: (result.answersV2 as UnifiedAnswersFromDB).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    ),
    setVariableHistory: (result.setVariableHistory as SetVariableHistoryItem[]).sort(
      (a, b) => a.index - b.index,
    ),
    visitedEdges: result.edges.sort((a, b) => a.index - b.index).map((edge) => edge.edgeId),
  }
}

const parseColateralVariableChangeIfAny = ({
  state,
  options,
}: {
  state: SessionState
  options: SetVariableBlock['options']
}): VariableWithUnknowValue[] => {
  if (!options || (options.type !== 'Pop' && options.type !== 'Shift')) return []
  const listVariableValue = state.botsQueue[0].bot.variables.find(
    (v) => v.id === options.variableId,
  )?.value
  const variable = state.botsQueue[0].bot.variables.find(
    (v) => v.id === options.saveItemInVariableId,
  )
  if (!variable || !listVariableValue) return []
  return [
    {
      ...variable,
      value: options.type === 'Pop' ? listVariableValue.at(-1) : listVariableValue.at(0),
    },
  ]
}
