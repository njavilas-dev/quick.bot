/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from '@quickbot.io/forge/zod'
import { useMemo } from 'react'
import { ZodObjectLayout } from './ZodObjectLayout'
import { isDefined } from '@quickbot.io/lib'
import { ForgedBlockDefinition, ForgedBlock } from '@quickbot.io/forge-repository/types'
import { FormControl, Select } from '@urbiport/ui'

type Props = {
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  schema: z.ZodOptional<z.ZodDiscriminatedUnion<'action', z.ZodObject<any>[]>>
  onDataChange: (options: ForgedBlock['options']) => void
}

export const ZodActionDiscriminatedUnion = ({
  blockDef,
  blockOptions,
  schema,
  onDataChange,
}: Props) => {
  const innerSchema = schema._def.innerType
  const currentOptions = blockOptions?.action
    ? innerSchema._def.optionsMap.get(blockOptions?.action)
    : undefined
  const keysBeforeActionField = useMemo(() => {
    if (!currentOptions) return []
    return Object.keys(currentOptions.shape).slice(
      0,
      Object.keys(currentOptions.shape).findIndex((key) => key === 'action') + 1,
    )
  }, [currentOptions])

  const handleActionChange = (action: string) => {
    onDataChange({ ...blockOptions, action })
  }

  return (
    <>
      <FormControl>
        <Select
          selectedItem={blockOptions?.action}
          onSelect={handleActionChange}
          items={[...innerSchema._def.optionsMap.keys()].filter(isDefined) as string[]}
          placeholder="Select an action"
        />
      </FormControl>
      {currentOptions && (
        <ZodObjectLayout
          schema={currentOptions}
          data={blockOptions}
          blockDef={blockDef}
          blockOptions={blockOptions}
          onDataChange={onDataChange}
          ignoreKeys={keysBeforeActionField}
        />
      )}
    </>
  )
}
