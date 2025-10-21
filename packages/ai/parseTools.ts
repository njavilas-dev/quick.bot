import { VariableStore } from '@quickbot.io/forge'
import { z } from '@quickbot.io/forge/zod'
import { executeFunction } from '@quickbot.io/variables/executeFunction'
import { Variable } from '@quickbot.io/variables/types'
import { CoreTool } from 'ai'
import { isNotEmpty } from '@quickbot.io/lib'
import { Tools } from './schemas'

export const parseTools = ({
  tools,
  variables,
}: {
  tools: Tools
  variables: VariableStore
  onNewVariabes?: (newVariables: Variable[]) => void
}): Record<string, CoreTool> => {
  if (!tools?.length) return {}
  const result = tools.reduce<Record<string, CoreTool>>((acc, tool) => {
    if (!tool.code || !tool.name) return acc
    const parameters = parseParameters(tool.parameters)
    acc[tool.name] = {
      description: tool.description,
      parameters,
      execute: async (args) => {
        const { output, newVariables } = await executeFunction({
          variables: variables.list(),
          args,
          body: tool.code!,
        })
        newVariables?.forEach((v) => variables.set(v.id, v.value))
        return output
      },
    } satisfies CoreTool
    return acc
  }, {})
  return result
}

const parseParameters = (
  parameters: NonNullable<Tools>[number]['parameters'],
): z.ZodTypeAny | undefined => {
  if (!parameters || parameters?.length === 0) return

  const shape: z.ZodRawShape = {}
  parameters.forEach((param) => {
    if (!param.name) return
    switch (param.type) {
      case 'string':
        shape[param.name] = z.string()
        break
      case 'number':
        shape[param.name] = z.number()
        break
      case 'boolean':
        shape[param.name] = z.boolean()
        break
      case 'enum': {
        if (!param.values || param.values.length === 0) break
        shape[param.name] = z.enum(param.values as [string, ...string[]])
        break
      }
    }
    if (isNotEmpty(param.description))
      shape[param.name] = shape[param.name].describe(param.description)
    if (param.required === false) shape[param.name] = shape[param.name].optional()
  })

  return z.object(shape)
}
