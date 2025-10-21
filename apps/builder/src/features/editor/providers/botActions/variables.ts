import { Bot, Variable } from '@quickbot.io/schemas'
import { SetBot } from '../BotProvider'
import { Draft, produce } from 'immer'

export type VariablesActions = {
  createVariable: (variable: Variable) => void
  updateVariable: (variableId: string, updates: Partial<Omit<Variable, 'id'>>) => void
  deleteVariable: (variableId: string) => void
}

export const variablesAction = (setBot: SetBot): VariablesActions => ({
  createVariable: (newVariable: Variable) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        bot.variables.unshift(newVariable)
      }),
    ),
  updateVariable: (variableId: string, updates: Partial<Omit<Variable, 'id'>>) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        bot.variables = bot.variables.map((v) => (v.id === variableId ? { ...v, ...updates } : v))
      }),
    ),
  deleteVariable: (itemId: string) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        deleteVariableDraft(bot, itemId)
      }),
    ),
})

const deleteVariableDraft = (bot: Draft<Bot>, variableId: string) => {
  const index = bot.variables.findIndex((v) => v.id === variableId)
  bot.variables.splice(index, 1)
}
