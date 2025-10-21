import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import { Result } from '@quickbot.io/schemas'
import { isDefined, isNotDefined } from '@quickbot.io/lib'

let progress = 0

const prismaWithLogging = withQueryLogging()

const bulkUpdate = async () => {
  await promptAndSetEnvironment()

  const results = (await prismaWithLogging.botResult.findMany({
    where: {
      variables: { equals: [] },
    },
    select: { variables: true, id: true },
  })) as Pick<Result, 'variables' | 'id'>[]

  const queries = results
    .map((result) => {
      if (result.variables.some((variable) => typeof variable.value !== 'string')) {
        return prismaWithLogging.botResult.updateMany({
          where: { id: result.id },
          data: {
            variables: result.variables
              .map((variable) => ({
                ...variable,
                value:
                  typeof variable.value !== 'string'
                    ? safeStringify(variable.value)
                    : variable.value,
              }))
              .filter(isDefined),
          },
        })
      }
    })
    .filter(isDefined)

  const total = queries.length

  // Añadir contador de progreso
  prismaWithLogging.$on('query', () => {
    progress += 1
    console.log(`Progress: ${progress}/${total}`)
  })

  await prismaWithLogging.$transaction(queries)
}

export const safeStringify = (val: unknown): string | null => {
  if (isNotDefined(val)) return null
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val)
  } catch {
    console.warn('Failed to safely stringify variable value', val)
    return null
  }
}

bulkUpdate()
