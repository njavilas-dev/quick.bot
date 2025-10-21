import { z } from '@quickbot.io/forge/zod'
import { ZodObjectLayout } from './ZodObjectLayout'
import { isDefined } from '@quickbot.io/lib'
import { ForgedBlockDefinition, ForgedBlock } from '@quickbot.io/forge-repository/types'
import { FormControl } from '@chakra-ui/react'
import { Select } from '@urbiport/ui'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const ZodDiscriminatedUnionLayout = ({
  discriminant,
  data,
  schema,
  dropdownPlaceholder,
  blockDef,
  blockOptions,
  onDataChange,
}: {
  discriminant: string
  data: any
  schema: z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]>
  dropdownPlaceholder: string
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  onDataChange: (value: string) => void
}) => {
  const currentOptions = data?.[discriminant]
    ? schema._def.optionsMap.get(data?.[discriminant])
    : undefined

  const handleDiscriminantChange = (item: string) => {
    onDataChange({ ...data, [discriminant]: item })
  }

  return (
    <>
      <FormControl>
        <Select
          selectedItem={data?.[discriminant]}
          onSelect={handleDiscriminantChange}
          items={[...schema._def.optionsMap.keys()].filter((key) => isDefined(key)) as string[]}
          placeholder={dropdownPlaceholder}
        />
      </FormControl>
      {currentOptions && (
        <ZodObjectLayout
          schema={currentOptions}
          data={data}
          blockDef={blockDef}
          blockOptions={blockOptions}
          onDataChange={onDataChange}
        />
      )}
    </>
  )
}
