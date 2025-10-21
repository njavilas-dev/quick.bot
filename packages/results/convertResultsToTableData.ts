import {
  ResultWithAnswers,
  ResultHeaderCell,
  VariableWithValue,
  Answer,
  TableData,
} from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { isDefined } from '../lib/utils'
import { secureVariable } from '@quickbot.io/variables/secureVariable'

type CellParser = (
  content: VariableWithValue['value'],
  blockType?: InputBlockType,
) => { element?: React.JSX.Element; plainText: string }

const defaultCellParser: CellParser = (content, blockType) => {
  if (!content) return { plainText: '' }
  if (Array.isArray(content))
    return {
      plainText: content.join(', '),
    }
  return blockType === InputBlockType.FILE
    ? { plainText: content }
    : { plainText: content.toString() }
}

type Props = {
  results: ResultWithAnswers[] | undefined
  headerCells: ResultHeaderCell[]
  cellParser?: CellParser
  blockIdVariableIdMap: Record<string, string>
}

export const convertResultsToTableData = ({
  results,
  headerCells,
  cellParser = defaultCellParser,
  blockIdVariableIdMap,
}: Props): TableData[] =>
  (results ?? []).map((result) => ({
    id: { plainText: result.id },
    date: {
      plainText: convertDateToReadable(result.createdAt),
    },
    ...[...result.answers, ...result.variables].reduce<{
      [key: string]: { element?: JSX.Element; plainText: string }
    }>((tableData, answerOrVariable) => {
      if ('blockId' in answerOrVariable) {
        const answer = answerOrVariable satisfies Pick<Answer, 'blockId' | 'content'>
        const answerVariableId = blockIdVariableIdMap[answer.blockId]
        const header = answerVariableId
          ? headerCells.find((headerCell) => headerCell.variableIds?.includes(answerVariableId))
          : headerCells.find((headerCell) =>
              headerCell.blocks?.some((block) => block.id === answer.blockId),
            )
        if (!header || !header.blocks || !header.blockType) return tableData
        return {
          ...tableData,
          [header.id]: cellParser(answer.content, header.blockType),
        }
      }
      const variable = answerOrVariable satisfies VariableWithValue
      if (variable.value === null) return tableData
      const headerId = headerCells.find((headerCell) =>
        headerCell.variableIds?.includes(variable.id),
      )?.id
      if (!headerId) return tableData
      if (isDefined(tableData[headerId])) return tableData

      // In Analytics/Logs (admin view), we show the real value for secret variables
      // Secret variables are encrypted in the database, so we need to decrypt them
      let valueToShow = variable.value
      if (variable.isSecretVariable && typeof variable.value === 'string') {
        try {
          valueToShow = secureVariable.decrypt(variable.value)
        } catch (error) {
          console.error(`Failed to decrypt variable ${variable.id}:`, error)
          // If decryption fails, show the encrypted value as-is
        }
      }

      return {
        ...tableData,
        [headerId]: cellParser(valueToShow),
      }
    }, {}),
  }))

const convertDateToReadable = (date: Date): string => {
  const isThisYear = new Date().getFullYear() === date.getFullYear()

  const dateString = date.toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
    year: isThisYear ? undefined : 'numeric', // Only show the year if it's not the current year
  })

  const timeString = date.toLocaleTimeString('default', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${dateString}, ${timeString}`
}
