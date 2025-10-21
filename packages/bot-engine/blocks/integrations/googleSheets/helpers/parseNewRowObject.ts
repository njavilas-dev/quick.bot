import { Variable, Cell as CellProps } from '@quickbot.io/schemas'
import { parseVariables } from '@quickbot.io/variables/parseVariables'

export const parseNewRowObject =
  (variables: Variable[]) =>
  (cells: CellProps[]): { [key: string]: string } =>
    cells.reduce((row, cell) => {
      return !cell.column || !cell.value
        ? row
        : {
            ...row,
            [cell.column]: parseVariables(variables)(cell.value),
          }
    }, {})
