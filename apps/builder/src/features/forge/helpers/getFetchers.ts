import { FetcherDefinition, AuthDefinition } from '@quickbot.io/forge'
import { ForgedBlockDefinition } from '@quickbot.io/forge-repository/types'

export const getFetchers = (blockDef: ForgedBlockDefinition) =>
  (blockDef.fetchers ?? []).concat(
    blockDef.actions.flatMap(
      (action) => (action.fetchers ?? []) as FetcherDefinition<AuthDefinition>[],
    ),
  )
