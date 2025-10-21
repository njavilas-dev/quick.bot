import { CodeIcon, CalendarIcon } from '@urbiport/icons'
import { ResultHeaderCell } from '@quickbot.io/schemas'
import { BlockIcon } from '@/features/editor/components/BlockIcon'

export const ResultsTableColumnIcon = ({ header }: { header: ResultHeaderCell }) =>
  header.blockType ? (
    <BlockIcon type={header.blockType} color="text.light" />
  ) : header.variableIds ? (
    <CodeIcon color="text.light" />
  ) : (
    <CalendarIcon color="text.light" />
  )
