import React from 'react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { SetVariableTag } from '@/features/graph/components/nodes/block/SetVariableTag'

export const useEffectiveVariableId = (propVariableId?: string, optionsVariableId?: string) => {
  return React.useMemo(
    () => propVariableId ?? optionsVariableId,
    [propVariableId, optionsVariableId],
  )
}

export const useVariableTag = (variableId?: string) => {
  const { bot } = useBot()

  return React.useMemo(() => {
    if (!variableId) return null
    const variableName = bot?.variables.find((v) => v.id === variableId)?.name ?? ''
    return <SetVariableTag variableName={variableName} />
  }, [bot, variableId])
}
