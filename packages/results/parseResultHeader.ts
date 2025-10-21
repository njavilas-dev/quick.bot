import {
  ResultWithAnswers,
  ResultHeaderCell,
  Group,
  Variable,
  InputBlock,
  Bot,
} from '@quickbot.io/schemas'
import { isInputBlock } from '@quickbot.io/schemas/helpers'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { byId, isNotEmpty } from '@quickbot.io/lib/utils'

export const parseResultHeader = (
  bot: Pick<Bot, 'groups' | 'variables'>,
  linkedBots: Pick<Bot, 'groups' | 'variables'>[] | undefined,
  results?: ResultWithAnswers[],
): ResultHeaderCell[] => {
  const parsedGroups = [
    ...bot.groups,
    ...(linkedBots ?? []).flatMap((linkedBot) => linkedBot.groups as Group[]),
  ]
  const parsedVariables = [
    ...bot.variables,
    ...(linkedBots ?? []).flatMap((linkedBot) => linkedBot.variables),
  ]
  const inputsResultHeader = parseInputsResultHeader({
    groups: parsedGroups,
    variables: parsedVariables,
  })
  return [
    { label: 'Submitted at', id: 'date' },
    ...inputsResultHeader,
    ...parseVariablesHeaders(parsedVariables, inputsResultHeader),
    ...parseResultsFromPreviousBotVersions({
      results: results ?? [],
      existingInputResultHeaders: inputsResultHeader,
      groups: parsedGroups,
    }),
  ]
}

type ResultHeaderCellWithBlock = Omit<ResultHeaderCell, 'blocks'> & {
  blocks: NonNullable<ResultHeaderCell['blocks']>
}

const parseInputsResultHeader = ({
  groups,
  variables,
}: {
  groups: Group[]
  variables: Variable[]
}): ResultHeaderCellWithBlock[] =>
  (
    groups
      .flatMap((group) =>
        group.blocks.map((block) => ({
          ...block,
          groupTitle: group.title,
          groupId: group.id,
        })),
      )
      .filter((block) => isInputBlock(block)) as (InputBlock & {
        groupId: string
        groupTitle: string
      })[]
  ).reduce<ResultHeaderCellWithBlock[]>((existingHeaders, inputBlock) => {
    // Skip input blocks that don't have a variableId (not saving data)
    if (!inputBlock.options?.variableId) return existingHeaders

    if (
      existingHeaders.some(
        (existingHeader) =>
          inputBlock.options?.variableId &&
          existingHeader.variableIds?.includes(inputBlock.options.variableId),
      )
    )
      return existingHeaders
    const matchedVariableName =
      inputBlock.options?.variableId && variables.find(byId(inputBlock.options.variableId))?.name

    // If no variable name found, skip this block
    if (!matchedVariableName) return existingHeaders

    let label = matchedVariableName
    const headerWithSameLabel = existingHeaders.find((h) => h.label === label)
    if (headerWithSameLabel) {
      const shouldMerge = headerWithSameLabel.blocks?.some((block) => block.id === inputBlock.id)
      if (shouldMerge) {
        const updatedHeaderCell: ResultHeaderCellWithBlock = {
          ...headerWithSameLabel,
          variableIds:
            headerWithSameLabel.variableIds && inputBlock.options?.variableId
              ? headerWithSameLabel.variableIds.concat([inputBlock.options.variableId])
              : undefined,
          blocks: headerWithSameLabel.blocks.concat({
            id: inputBlock.id,
            groupId: inputBlock.groupId,
          }),
        }
        return [
          ...existingHeaders.filter((existingHeader) => existingHeader.label !== label),
          updatedHeaderCell,
        ]
      }
      const totalPrevious = existingHeaders.filter((h) => h.label.includes(label)).length
      const newHeaderCell: ResultHeaderCellWithBlock = {
        id: inputBlock.id,
        label: label + ` (${totalPrevious})`,
        blocks: [
          {
            id: inputBlock.id,
            groupId: inputBlock.groupId,
          },
        ],
        blockType: inputBlock.type,
        variableIds: inputBlock.options?.variableId ? [inputBlock.options.variableId] : undefined,
      }
      return [...existingHeaders, newHeaderCell]
    }

    const newHeaderCell: ResultHeaderCellWithBlock = {
      id: inputBlock.id,
      label,
      blocks: [
        {
          id: inputBlock.id,
          groupId: inputBlock.groupId,
        },
      ],
      blockType: inputBlock.type,
      variableIds: inputBlock.options?.variableId ? [inputBlock.options.variableId] : undefined,
    }

    return [...existingHeaders, newHeaderCell]
  }, [])

const parseVariablesHeaders = (
  variables: Variable[],
  existingInputResultHeaders: ResultHeaderCell[],
) =>
  variables.reduce<ResultHeaderCell[]>((existingHeaders, variable) => {
    // Skip if already included in input headers
    if (
      existingInputResultHeaders.some((existingInputResultHeader) =>
        existingInputResultHeader.variableIds?.includes(variable.id),
      )
    )
      return existingHeaders

    // Include variable if:
    // - It's marked to save in results OR
    // - It's a secret variable OR
    // - It's a system variable (always show in Analytics/Logs)
    const shouldInclude =
      variable.isSavedVariable || variable.isSecretVariable || variable.isSystemVariable
    if (!shouldInclude) return existingHeaders

    const headerCellWithSameLabel = existingHeaders.find(
      (existingHeader) => existingHeader.label === variable.name,
    )
    if (headerCellWithSameLabel) {
      const updatedHeaderCell: ResultHeaderCell = {
        ...headerCellWithSameLabel,
        variableIds: headerCellWithSameLabel.variableIds?.concat([variable.id]),
      }
      return [...existingHeaders.filter((h) => h.label !== variable.name), updatedHeaderCell]
    }
    const newHeaderCell: ResultHeaderCell = {
      id: variable.id,
      label: variable.name,
      variableIds: [variable.id],
      // Mark if it's a system variable for future reference
      isSystemVariable: variable.isSystemVariable,
    }

    return [...existingHeaders, newHeaderCell]
  }, [])

const parseResultsFromPreviousBotVersions = ({
  results,
  existingInputResultHeaders,
  groups,
}: {
  results: ResultWithAnswers[]
  existingInputResultHeaders: ResultHeaderCell[]
  groups: Group[]
}): ResultHeaderCell[] =>
  results
    .flatMap((result) => result.answers)
    .filter(
      (answer) =>
        existingInputResultHeaders.every((header) => header.id !== answer.blockId) &&
        isNotEmpty(answer.content),
    )
    .reduce<ResultHeaderCell[]>((existingHeaders, answer) => {
      if (existingHeaders.some((existingHeader) => existingHeader.id === answer.blockId))
        return existingHeaders
      const groupId =
        groups.find((group) => group.blocks.some((block) => block.id === answer.blockId))?.id ?? ''
      return [
        ...existingHeaders,
        {
          id: answer.blockId,
          label: `${answer.blockId} (deleted block)`,
          blocks: [
            {
              id: answer.blockId,
              groupId,
            },
          ],
          blockType: InputBlockType.TEXT,
        },
      ]
    }, [])
